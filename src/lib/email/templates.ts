// Email template utilities

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #ffffff;
    background-color: #0A0A0A;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .header {
    text-align: center;
    margin-bottom: 40px;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    background: linear-gradient(135deg, #1A89FF 0%, #8C1AFF 50%, #FF1AA3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .card {
    background: #141414;
    border: 1px solid #1F1F1F;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
  }
  .title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
  }
  .text {
    font-size: 16px;
    color: #A3A3A3;
    margin: 0 0 16px 0;
  }
  .highlight {
    color: #1A89FF;
    font-weight: 600;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #1A89FF 0%, #8C1AFF 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 600;
    margin: 16px 0;
  }
  .details {
    background: #0A0A0A;
    border: 1px solid #1F1F1F;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }
  .details-row {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
  }
  .details-label {
    color: #737373;
    font-size: 14px;
  }
  .details-value {
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
  .footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #1F1F1F;
    color: #737373;
    font-size: 14px;
  }
  .footer a {
    color: #1A89FF;
    text-decoration: none;
  }
`;

function getBaseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">V2K</div>
          </div>
          ${content}
          <div class="footer">
            <p>
              © ${new Date().getFullYear()} V2K Music. Todos os direitos reservados.<br>
              <a href="${process.env.NEXTAUTH_URL}">Acessar Plataforma</a> •
              <a href="${process.env.NEXTAUTH_URL}/profile">Gerenciar Preferências</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function investmentConfirmationEmail({
  userName,
  trackTitle,
  artistName,
  tokensAmount,
  totalValue,
  txHash,
}: {
  userName: string;
  trackTitle: string;
  artistName: string;
  tokensAmount: number;
  totalValue: number;
  txHash?: string;
}) {
  const content = `
    <div class="card">
      <h1 class="title">✅ Investimento Confirmado!</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        Seu investimento foi processado com sucesso!
      </p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Música:</span>
          <span class="details-value">${trackTitle}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Artista:</span>
          <span class="details-value">${artistName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Tokens:</span>
          <span class="details-value">${tokensAmount}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Valor Total:</span>
          <span class="details-value">R$ ${totalValue.toFixed(2)}</span>
        </div>
        ${txHash ? `
        <div class="details-row">
          <span class="details-label">Hash:</span>
          <span class="details-value" style="font-size: 12px;">${txHash.slice(0, 20)}...</span>
        </div>
        ` : ''}
      </div>

      <p class="text">
        Você agora possui <span class="highlight">${tokensAmount} tokens</span> desta música
        e começará a receber royalties proporcionalmente.
      </p>

      <a href="${process.env.NEXTAUTH_URL}/portfolio" class="button">
        Ver Meu Portfólio
      </a>
    </div>
  `;

  return {
    subject: `✅ Investimento confirmado - ${trackTitle}`,
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nSeu investimento foi processado com sucesso!\n\nMúsica: ${trackTitle}\nArtista: ${artistName}\nTokens: ${tokensAmount}\nValor Total: R$ ${totalValue.toFixed(2)}\n\nAcesse seu portfólio em: ${process.env.NEXTAUTH_URL}/portfolio`,
  };
}

export function royaltyDistributionEmail({
  userName,
  trackTitle,
  artistName,
  royaltyAmount,
  totalTokens,
}: {
  userName: string;
  trackTitle: string;
  artistName: string;
  royaltyAmount: number;
  totalTokens: number;
}) {
  const content = `
    <div class="card">
      <h1 class="title">💰 Novos Royalties Disponíveis!</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        Você recebeu royalties de uma de suas músicas!
      </p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Música:</span>
          <span class="details-value">${trackTitle}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Artista:</span>
          <span class="details-value">${artistName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Seus Tokens:</span>
          <span class="details-value">${totalTokens}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Royalty Recebido:</span>
          <span class="details-value" style="color: #10B981;">R$ ${royaltyAmount.toFixed(2)}</span>
        </div>
      </div>

      <p class="text">
        Os royalties já estão disponíveis para resgate em seu portfólio.
      </p>

      <a href="${process.env.NEXTAUTH_URL}/portfolio" class="button">
        Resgatar Royalties
      </a>
    </div>
  `;

  return {
    subject: `💰 Você recebeu R$ ${royaltyAmount.toFixed(2)} em royalties!`,
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nVocê recebeu royalties!\n\nMúsica: ${trackTitle}\nArtista: ${artistName}\nRoyalty: R$ ${royaltyAmount.toFixed(2)}\n\nAcesse seu portfólio: ${process.env.NEXTAUTH_URL}/portfolio`,
  };
}

export function priceAlertEmail({
  userName,
  trackTitle,
  artistName,
  oldPrice,
  newPrice,
  changePercent,
}: {
  userName: string;
  trackTitle: string;
  artistName: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
}) {
  const isIncrease = changePercent > 0;
  const emoji = isIncrease ? '📈' : '📉';
  const color = isIncrease ? '#10B981' : '#EF4444';

  const content = `
    <div class="card">
      <h1 class="title">${emoji} Alerta de Preço</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        O preço de uma música que você acompanha mudou significativamente.
      </p>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Música:</span>
          <span class="details-value">${trackTitle}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Artista:</span>
          <span class="details-value">${artistName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Preço Anterior:</span>
          <span class="details-value">R$ ${oldPrice.toFixed(2)}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Novo Preço:</span>
          <span class="details-value" style="color: ${color};">R$ ${newPrice.toFixed(2)}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Variação:</span>
          <span class="details-value" style="color: ${color};">
            ${isIncrease ? '+' : ''}${changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <a href="${process.env.NEXTAUTH_URL}/track/${trackTitle}" class="button">
        Ver Música
      </a>
    </div>
  `;

  return {
    subject: `${emoji} Alerta: ${trackTitle} ${isIncrease ? 'subiu' : 'caiu'} ${Math.abs(changePercent).toFixed(1)}%`,
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nAlerta de preço!\n\nMúsica: ${trackTitle}\nArtista: ${artistName}\nPreço: R$ ${oldPrice.toFixed(2)} → R$ ${newPrice.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)\n\nVer música: ${process.env.NEXTAUTH_URL}/track/${trackTitle}`,
  };
}

export function welcomeEmail({ userName, email }: { userName: string; email: string }) {
  const content = `
    <div class="card">
      <h1 class="title">🎉 Bem-vindo ao V2K!</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        Estamos muito felizes em tê-lo conosco! Você acaba de entrar na próxima geração
        de investimento em música.
      </p>

      <p class="text">
        Com o V2K, você pode:
      </p>
      <ul class="text" style="margin: 16px 0; padding-left: 20px;">
        <li>Investir em músicas promissoras antes do estouro</li>
        <li>Receber royalties proporcionais aos seus tokens</li>
        <li>Negociar tokens no marketplace</li>
        <li>Acompanhar seu portfólio em tempo real</li>
      </ul>

      <a href="${process.env.NEXTAUTH_URL}/marketplace" class="button">
        Explorar Músicas
      </a>

      <p class="text" style="margin-top: 24px; font-size: 14px;">
        Se tiver alguma dúvida, nossa equipe está pronta para ajudar em
        <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #1A89FF;">${EMAIL_CONFIG.replyTo}</a>
      </p>
    </div>
  `;

  return {
    subject: '🎉 Bem-vindo ao V2K Music!',
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nBem-vindo ao V2K Music!\n\nVocê agora pode investir em músicas, receber royalties e negociar tokens.\n\nComece explorando: ${process.env.NEXTAUTH_URL}/marketplace\n\nSuporte: support@v2kmusic.com`,
  };
}

export function kycApprovedEmail({ userName }: { userName: string }) {
  const content = `
    <div class="card">
      <h1 class="title">✅ KYC Aprovado!</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        Sua verificação de identidade foi aprovada com sucesso!
      </p>

      <p class="text">
        Agora você tem acesso completo à plataforma e pode:
      </p>
      <ul class="text" style="margin: 16px 0; padding-left: 20px;">
        <li>Investir em qualquer música disponível</li>
        <li>Vender seus tokens no marketplace</li>
        <li>Retirar seus fundos quando quiser</li>
      </ul>

      <a href="${process.env.NEXTAUTH_URL}/marketplace" class="button">
        Começar a Investir
      </a>
    </div>
  `;

  return {
    subject: '✅ Sua conta foi verificada!',
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nSua verificação KYC foi aprovada!\n\nVocê agora tem acesso completo à plataforma.\n\nComece a investir: ${process.env.NEXTAUTH_URL}/marketplace`,
  };
}

export function passwordResetEmail({
  userName,
  resetToken,
}: {
  userName: string;
  resetToken: string;
}) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  const content = `
    <div class="card">
      <h1 class="title">🔐 Redefinir Senha</h1>
      <p class="text">
        Olá <span class="highlight">${userName}</span>,<br><br>
        Recebemos uma solicitação para redefinir a senha da sua conta V2K.
      </p>

      <p class="text">
        Clique no botão abaixo para criar uma nova senha:
      </p>

      <a href="${resetUrl}" class="button">
        Redefinir Minha Senha
      </a>

      <p class="text" style="margin-top: 24px; font-size: 14px; color: #737373;">
        Este link expira em <strong>1 hora</strong>.<br><br>
        Se você não solicitou esta redefinição, pode ignorar este email com segurança.
        Sua senha permanecerá inalterada.
      </p>

      <p class="text" style="margin-top: 16px; font-size: 12px; color: #525252;">
        Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
        <a href="${resetUrl}" style="color: #1A89FF; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  `;

  return {
    subject: '🔐 Redefinir sua senha - V2K Music',
    html: getBaseTemplate(content),
    text: `Olá ${userName},\n\nRecebemos uma solicitação para redefinir sua senha.\n\nClique no link abaixo para criar uma nova senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`,
  };
}

// Import EMAIL_CONFIG at the top
import { EMAIL_CONFIG } from './resend';
