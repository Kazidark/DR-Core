import {
    Laptop,
    Server,
    Mail,
    Shield,
    Users,
    Network,
    Database,
    HardDrive
} from "lucide-react";

import type { DRIconName } from "./DRIcon.types";

interface Props{
    name:DRIconName;
    size?:number;
}

export default function DRIcon({
    name,
    size=80
}:Props){

    const icons={
        laptop:Laptop,
        server:Server,
        mail:Mail,
        shield:Shield,
        users:Users,
        network:Network,
        database:Database,
        hardDrive:HardDrive
    };

    const Icon=icons[name];

    return <Icon size={size}/>;

}