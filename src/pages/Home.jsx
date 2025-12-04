import { ThemeToggle } from "../components/ThemeToggle";
import FBO from "../components/FBO";

export const Home = () => {
    return (
        <div className = "min-h-screen bg-background text-foreground overflow-x-hidden">
            {/*Theme toggle button */}    
            <ThemeToggle />

            {/*FBO? */}
            <div className="mt-12 px-4 md:px-8">
                <div className="relative w-full h-96 md:h-[600px] max-w-5xl mx-auto rounded-lg overflow-hidden">
                    <FBO />
                </div>
            </div>

            {/*Navbar */}


            {/*Main content */}

            
            {/*Footer */}

        </div>
    );
}