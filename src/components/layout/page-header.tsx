import { Button } from "@/components/ui";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="mb-4 sm:mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-2 line-clamp-2">{subtitle}</p>
          )}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant="secondary"
            size="sm"
            icon={action.icon}
            className="w-full sm:w-auto"
          >
            {action.label}
          </Button>
        )}
      </div>
    </header>
  );
}
