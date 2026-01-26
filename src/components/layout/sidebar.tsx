import { navigationItems } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">Lottery Management</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                {navigationItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                        <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                        {item.badge && (
                                            <span className="ml-auto text-xs">{item.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="border-t p-4">
                <UserProfile />
            </div>
        </div>
    );
}