import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import {
    AppLayout,
    DRContainer,
    DRPage,
    DRText,
} from "@/design-system";

import {
    Sidebar,
} from "@/app/sidebar";

import {
    TopBar,
} from "@/app/topbar";

import {
    useAuth,
} from "@/auth";

import Dashboard from "@/pages/Dashboard/Dashboard";
import Inventario from "@/pages/Inventario/Inventario";
import Impresoras from "@/pages/Impresoras/Impresoras";
import Vpn from "@/pages/Vpn/Vpn";
import Ips from "@/pages/Ips/Ips";
import Correos from "@/pages/Correos/Correos";
import LicenciasOffice from "@/pages/LicenciasOffice/LicenciasOffice";
import Login from "@/pages/Login/Login";
import RecuperarPassword from "@/pages/RecuperarPassword/RecuperarPassword";
import RestablecerPassword from "@/pages/RestablecerPassword/RestablecerPassword";
import Usuarios from "@/pages/Usuarios/Usuarios";


type ModuloTemporalProps = {
    title:
        string;

    description:
        string;
};


function ModuloTemporal({
    title,
    description,
}: ModuloTemporalProps) {

    return (

        <DRPage
            title={
                title
            }

            description={
                description
            }

            hideHeader
        >

            <DRContainer
                fluid
                padding="none"
            >

                <div
                    style={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        minHeight:
                            "60vh",
                    }}
                >

                    <div
                        style={{
                            textAlign:
                                "center",
                        }}
                    >

                        <DRText
                            as="h2"
                            variant="h2"
                            weight="bold"
                        >
                            {
                                title
                            }
                        </DRText>


                        <div
                            style={{
                                marginTop:
                                    "8px",
                            }}
                        >

                            <DRText
                                variant="body"
                                color="secondary"
                            >
                                Módulo preparado para desarrollo.
                            </DRText>

                        </div>

                    </div>

                </div>

            </DRContainer>

        </DRPage>

    );

}


function App() {

    const {
        usuario,
        cargando,
    } =
        useAuth();


    if (
        cargando
    ) {

        return (

            <div
                style={{
                    minHeight:
                        "100dvh",

                    display:
                        "grid",

                    placeItems:
                        "center",

                    color:
                        "#64748B",

                    fontSize:
                        "14px",
                }}
            >
                Cargando sesión...
            </div>

        );

    }


    if (
        !usuario
    ) {

        return (

            <Routes>

                <Route
                    path="/login"

                    element={
                        <Login />
                    }
                />


                <Route
                    path="/recuperar-password"

                    element={
                        <RecuperarPassword />
                    }
                />


                <Route
                    path="/restablecer-password"

                    element={
                        <RestablecerPassword />
                    }
                />


                <Route
                    path="*"

                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        );

    }


    const esAdministrador =
        usuario.rol ===
        "Administrador";


    const inicio =
        "/dashboard";


    return (

        <AppLayout
            sidebar={
                <Sidebar />
            }

            header={
                <TopBar />
            }
        >

            <Routes>

                <Route
                    path="/"

                    element={
                        <Navigate
                            to={
                                inicio
                            }

                            replace
                        />
                    }
                />


                <Route
                    path="/login"

                    element={
                        <Navigate
                            to={
                                inicio
                            }

                            replace
                        />
                    }
                />


                <Route
                    path="/recuperar-password"

                    element={
                        <RecuperarPassword />
                    }
                />


                <Route
                    path="/restablecer-password"

                    element={
                        <RestablecerPassword />
                    }
                />


                {/* DASHBOARD */}

                <Route
                    path="/dashboard"

                    element={
                        <Dashboard />
                    }
                />


                {/* INVENTARIO */}

                <Route
                    path="/inventario"

                    element={
                        <Inventario />
                    }
                />


                {/* IMPRESORAS */}

                <Route
                    path="/impresoras"

                    element={
                        <Impresoras />
                    }
                />


                {/* VPN */}

                <Route
                    path="/vpn"

                    element={
                        esAdministrador
                            ? (
                                <Vpn />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* IP */}

                <Route
                    path="/ip"

                    element={
                        esAdministrador
                            ? (
                                <Ips />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* CORREOS */}

                <Route
                    path="/correos"

                    element={
                        esAdministrador
                            ? (
                                <Correos />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* LICENCIAS OFFICE */}

                <Route
                    path="/licencias-office"

                    element={
                        esAdministrador
                            ? (
                                <LicenciasOffice />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* SERVIDORES */}

                <Route
                    path="/servidores"

                    element={
                        esAdministrador
                            ? (
                                <ModuloTemporal
                                    title="Servidores"
                                    description="Gestión de servidores"
                                />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* SWITCH */}

                <Route
                    path="/switch"

                    element={
                        esAdministrador
                            ? (
                                <ModuloTemporal
                                    title="Switch"
                                    description="Gestión de equipos de red"
                                />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                {/* USUARIOS */}

                <Route
                    path="/usuarios"

                    element={
                        esAdministrador
                            ? (
                                <Usuarios />
                            )
                            : (
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            )
                    }
                />


                <Route
                    path="*"

                    element={
                        <Navigate
                            to={
                                inicio
                            }

                            replace
                        />
                    }
                />

            </Routes>

        </AppLayout>

    );

}


export default App;