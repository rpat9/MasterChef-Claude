import { Logo } from "./Logo";
import NavigationManager from "./Navigation";

export default function ChefHeader() {
    return (
        <header className="flex flex-col relative">
            <div className="flex justify-between p-4 h-[85px] bg-[var(--card-bg)] cursor-default">
                <Logo />
                <NavigationManager />
            </div>
        </header>
    );
}