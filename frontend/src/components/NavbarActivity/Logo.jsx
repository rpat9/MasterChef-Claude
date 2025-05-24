import MasterChefClaude from "../../assets/masterChef_claude.jsx";
import { Link } from "react-router-dom";

export function Logo() {
    return (
        <div className="flex items-center gap-2 lg:gap-4 max-w-[75%]">

            <Link to="/" className="flex-shrink-0">
                <MasterChefClaude />
            </Link>

            <Link to="/" className="hover:text-[color:var(--color-secondary)]">
                <h1 className="color-[var(--color-text)] text-lg lg:text-2xl xl:text-3xl font-bold leading-tight">
                    MasterChef Claude
                </h1>
            </Link>
            
        </div>
    );
}