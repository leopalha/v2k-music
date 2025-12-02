import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Cron job to process pending limit orders
 * This endpoint should be called periodically (e.g., every 5 minutes) by Vercel Cron
 *
 * Configure in vercel.json crons array with schedule: every 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[CRON] Processing limit orders...");

    const now = new Date();
    let processedCount = 0;
    let executedCount = 0;
    let expiredCount = 0;

    // Get all pending limit orders
    const pendingOrders = await prisma.limitOrder.findMany({
      where: { status: "PENDING" },
      include: {
        track: true,
        user: true,
      },
    });

    console.log(`[CRON] Found ${pendingOrders.length} pending orders`);

    for (const order of pendingOrders) {
      processedCount++;

      // Check if expired
      if (order.expiresAt && new Date(order.expiresAt) < now) {
        await prisma.limitOrder.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });
        expiredCount++;
        console.log(`[CRON] Order ${order.id} expired`);
        continue;
      }

      // Check if price condition is met
      const currentPrice = order.track.currentPrice;
      let shouldExecute = false;

      if (order.orderType === "BUY" && currentPrice <= order.targetPrice) {
        // Buy order: execute when price drops to target or below
        shouldExecute = true;
      } else if (order.orderType === "SELL" && currentPrice >= order.targetPrice) {
        // Sell order: execute when price rises to target or above
        shouldExecute = true;
      }

      if (!shouldExecute) {
        continue;
      }

      console.log(
        `[CRON] Executing ${order.orderType} order ${order.id} for track ${order.track.title}`
      );

      try {
        // Execute the order
        await prisma.$transaction(async (tx) => {
          // For BUY orders
          if (order.orderType === "BUY") {
            const totalCost = currentPrice * order.amount;

            // Check user balance
            if (order.user.cashBalance < totalCost) {
              // Insufficient funds - mark as failed
              await tx.limitOrder.update({
                where: { id: order.id },
                data: { status: "FAILED" },
              });
              console.log(`[CRON] Order ${order.id} failed - insufficient funds`);
              return;
            }

            // Deduct balance
            await tx.user.update({
              where: { id: order.userId },
              data: { cashBalance: { decrement: totalCost } },
            });

            // Create or update portfolio
            const existingPortfolio = await tx.portfolio.findUnique({
              where: {
                userId_trackId: {
                  userId: order.userId,
                  trackId: order.trackId,
                },
              },
            });

            if (existingPortfolio) {
              // Update existing
              const newTotalInvested = existingPortfolio.totalInvested + totalCost;
              const newAmount = existingPortfolio.amount + order.amount;
              const newAvgPrice = newTotalInvested / newAmount;

              await tx.portfolio.update({
                where: { id: existingPortfolio.id },
                data: {
                  amount: newAmount,
                  avgBuyPrice: newAvgPrice,
                  totalInvested: newTotalInvested,
                  currentValue: newAmount * currentPrice,
                  unrealizedPnL: newAmount * currentPrice - newTotalInvested,
                },
              });
            } else {
              // Create new
              await tx.portfolio.create({
                data: {
                  userId: order.userId,
                  trackId: order.trackId,
                  amount: order.amount,
                  avgBuyPrice: currentPrice,
                  totalInvested: totalCost,
                  currentValue: order.amount * currentPrice,
                  unrealizedPnL: 0,
                },
              });
            }

            // Create transaction record
            const transaction = await tx.transaction.create({
              data: {
                userId: order.userId,
                trackId: order.trackId,
                type: "BUY",
                amount: order.amount,
                price: currentPrice,
                totalValue: totalCost,
                fee: 0,
                status: "COMPLETED",
                paymentMethod: "BALANCE",
              },
            });

            // Update track
            await tx.track.update({
              where: { id: order.trackId },
              data: {
                availableSupply: { decrement: order.amount },
              },
            });

            // Mark order as executed
            await tx.limitOrder.update({
              where: { id: order.id },
              data: {
                status: "EXECUTED",
                executedAt: now,
                executedPrice: currentPrice,
                executedAmount: order.amount,
                transactionId: transaction.id,
              },
            });

            executedCount++;
            console.log(`[CRON] BUY order ${order.id} executed successfully`);
          }

          // For SELL orders
          else if (order.orderType === "SELL") {
            // Check user has enough tokens
            const portfolio = await tx.portfolio.findUnique({
              where: {
                userId_trackId: {
                  userId: order.userId,
                  trackId: order.trackId,
                },
              },
            });

            if (!portfolio || portfolio.amount < order.amount) {
              // Insufficient tokens - mark as failed
              await tx.limitOrder.update({
                where: { id: order.id },
                data: { status: "FAILED" },
              });
              console.log(`[CRON] Order ${order.id} failed - insufficient tokens`);
              return;
            }

            const totalRevenue = currentPrice * order.amount;

            // Update portfolio
            const newAmount = portfolio.amount - order.amount;
            if (newAmount === 0) {
              // Sold all - delete portfolio entry
              await tx.portfolio.delete({
                where: { id: portfolio.id },
              });
            } else {
              // Partial sell
              const soldInvestment =
                (order.amount / portfolio.amount) * portfolio.totalInvested;
              await tx.portfolio.update({
                where: { id: portfolio.id },
                data: {
                  amount: newAmount,
                  totalInvested: portfolio.totalInvested - soldInvestment,
                  currentValue: newAmount * currentPrice,
                  unrealizedPnL:
                    newAmount * currentPrice -
                    (portfolio.totalInvested - soldInvestment),
                },
              });
            }

            // Add to user balance
            await tx.user.update({
              where: { id: order.userId },
              data: { cashBalance: { increment: totalRevenue } },
            });

            // Create transaction record
            const transaction = await tx.transaction.create({
              data: {
                userId: order.userId,
                trackId: order.trackId,
                type: "SELL",
                amount: order.amount,
                price: currentPrice,
                totalValue: totalRevenue,
                fee: 0,
                status: "COMPLETED",
              },
            });

            // Update track
            await tx.track.update({
              where: { id: order.trackId },
              data: {
                availableSupply: { increment: order.amount },
              },
            });

            // Mark order as executed
            await tx.limitOrder.update({
              where: { id: order.id },
              data: {
                status: "EXECUTED",
                executedAt: now,
                executedPrice: currentPrice,
                executedAmount: order.amount,
                transactionId: transaction.id,
              },
            });

            executedCount++;
            console.log(`[CRON] SELL order ${order.id} executed successfully`);
          }
        });
      } catch (error) {
        console.error(`[CRON] Error executing order ${order.id}:`, error);
        // Mark as failed
        await prisma.limitOrder.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
      }
    }

    const result = {
      success: true,
      processed: processedCount,
      executed: executedCount,
      expired: expiredCount,
      timestamp: now.toISOString(),
    };

    console.log(`[CRON] Processing complete:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON] Error processing limit orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
