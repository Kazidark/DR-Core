import "./theme.css";

import { useEffect } from "react";

interface Props{
    children:React.ReactNode;
}

export function DRThemeProvider({children}:Props){

    useEffect(()=>{

        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );

    },[]);

    return <>{children}</>;

}