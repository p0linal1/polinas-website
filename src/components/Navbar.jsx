import  {cn} from "@/lib/utils";
import { useEffect, useState } from "react";


const navItems = [
    {name: "Home", href: "#hero"}, 
    {name: "About", href: "#about"},
    {name: "Skills", href: "#skills"},
    {name: "Experience", href: "#experience"},
    {name: "Projects", href: "#projects"},
    {name: "Music", href: "#music"},
    {name: "Contact", href: "#contact"}
]




export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.screenY > 10);
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [])
    return (
        <nav className = {cn("fixed w-full z-40 transition-all duration-300", 
                            isScrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-xs" : "py-5"
        )}>
            {/* <div className = "container flex items-center justify-between">
                <a className = "text-xl font-bold text-primary flex items-center"> 
                    <span className = "relative z-10">
                        <span className = "text-glow"> Polina</span> Portfolio
                    </span>
                </a>


            </div> */}



        </nav>
    );
};