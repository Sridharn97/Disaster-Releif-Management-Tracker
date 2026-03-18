export default function DetailCard({ title, label, value, icon: Icon }) {
    const heading = title || label;

    return (
        <div className="stat-card space-y-3">
            {(heading || Icon) && (
                <div className="flex items-start justify-between gap-3">
                    {heading && (
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                            {heading}
                        </p>
                    )}
                    {Icon && (
                        <div className="text-muted-foreground">
                            <Icon className="w-4 h-4"/>
                        </div>
                    )}
                </div>
            )}
            <p className="text-base font-mono font-bold text-foreground break-words">
                {value}
            </p>
        </div>
    );
}
