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


    /* =====================================================
       VALIDANDO SESIÓN
       ===================================================== */

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


    /* =====================================================
       NO AUTENTICADO
       ===================================================== */

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


    /* =====================================================
       USUARIO AUTENTICADO
       ===================================================== */

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

                {/* =====================================
                    INICIO
                    ===================================== */}

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


                {/* =====================================
                    RECUPERACIÓN DE CONTRASEÑA
                    ===================================== */}

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


                {/* =====================================
                    DASHBOARD
                    ===================================== */}

                <Route
                    path="/dashboard"

                    element={
                        <Dashboard />
                    }
                />


                {/* =====================================
                    INVENTARIO
                    ===================================== */}

                <Route
                    path="/inventario"

                    element={
                        <Inventario />
                    }
                />


                {/* =====================================
                    VPN
                    ===================================== */}

                <Route
    path="/vpn"

    element={
        <Vpn />
    }
/>


                {/* =====================================
                    CORREOS
                    ===================================== */}

                <Route
                    path="/correos"

                    element={
                        esAdministrador
                            ? (
                                <ModuloTemporal
                                    title="Correos"
                                    description="Gestión de cuentas de correo"
                                />
                            )
                            : (
                                <Navigate
                                    to="/inventario"
                                    replace
                                />
                            )
                    }
                />


                {/* =====================================
                    IP
                    ===================================== */}

                <Route
    path="/ip"
    element={
        <Ips />
    }
/>


                {/* =====================================
    IMPRESORAS
    ===================================== */}

<Route
    path="/impresoras"

    element={
        <Impresoras />
    }
/>


                {/* =====================================
                    SERVIDORES
                    ===================================== */}

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
                                    to="/inventario"
                                    replace
                                />
                            )
                    }
                />


                {/* =====================================
                    SWITCH
                    ===================================== */}

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
                                    to="/inventario"
                                    replace
                                />
                            )
                    }
                />


                {/* =====================================
                    USUARIOS
                    ===================================== */}

                <Route
                    path="/usuarios"

                    element={
                        esAdministrador
                            ? (
                                <Usuarios />
                            )
                            : (
                                <Navigate
                                    to="/inventario"
                                    replace
                                />
                            )
                    }
                />


                {/* =====================================
                    RUTA NO ENCONTRADA
                    ===================================== */}

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