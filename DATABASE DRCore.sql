IF DB_ID('DRCore') IS NULL
BEGIN
    CREATE DATABASE DRCore;
END;
GO

USE DRCore;
GO
CREATE TABLE PasswordResetTokens
(
    Id INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_PasswordResetTokens
        PRIMARY KEY,

    UsuarioId INT NOT NULL,

    TokenHash VARCHAR(64) NOT NULL,

    ExpiraEn DATETIME2 NOT NULL,

    Utilizado BIT NOT NULL
        CONSTRAINT DF_PasswordResetTokens_Utilizado
        DEFAULT 0,

    CreadoEn DATETIME2 NOT NULL
        CONSTRAINT DF_PasswordResetTokens_CreadoEn
        DEFAULT SYSDATETIME(),

    UtilizadoEn DATETIME2 NULL,

    CONSTRAINT FK_PasswordResetTokens_Usuarios
        FOREIGN KEY (UsuarioId)
        REFERENCES Usuarios(Id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_PasswordResetTokens_TokenHash
ON PasswordResetTokens(TokenHash);


CREATE INDEX IX_PasswordResetTokens_UsuarioId
ON PasswordResetTokens(UsuarioId);

SELECT TOP 10 *
FROM PasswordResetTokens;



/* ============================================================
   PC / LAPTOPS
   ============================================================ */


IF OBJECT_ID('dbo.PCLaptops', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PCLaptops
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Tipo VARCHAR(20) NOT NULL,
        Serial VARCHAR(100) NOT NULL,
        Marca VARCHAR(100) NULL,
        Modelo VARCHAR(150) NULL,
        Caracteristicas VARCHAR(1000) NULL,
        Anexo VARCHAR(100) NULL,
        EstadoEquipo VARCHAR(20) NOT NULL DEFAULT 'Stock',
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        UltimoUsuario VARCHAR(200) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,
        Oficina VARCHAR(150) NULL,
        Ubicacion VARCHAR(200) NULL,
        Observaciones VARCHAR(2000) NULL,
        Posicion VARCHAR(100) NULL,

        CONSTRAINT UQ_PCLaptops_Serial UNIQUE (Serial),

        CONSTRAINT CK_PCLaptops_Tipo
            CHECK (Tipo IN ('Laptop', 'Desktop')),

        CONSTRAINT CK_PCLaptops_Estado
            CHECK (
                EstadoEquipo IN (
                    'Operativo',
                    'Inoperativo',
                    'Donado',
                    'Vendido',
                    'Stock'
                )
            )
    );
END;
GO


/* ============================================================
   MONITORES
   ============================================================ */

IF OBJECT_ID('dbo.Monitores', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Monitores
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Serial VARCHAR(100) NOT NULL,
        Marca VARCHAR(100) NULL,
        Modelo VARCHAR(150) NULL,
        Caracteristicas VARCHAR(1000) NULL,
        Anexo VARCHAR(100) NULL,
        EstadoEquipo VARCHAR(20) NOT NULL DEFAULT 'Stock',
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        UltimoUsuario VARCHAR(200) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,
        Oficina VARCHAR(150) NULL,
        Ubicacion VARCHAR(200) NULL,
        Observaciones VARCHAR(2000) NULL,
        Posicion VARCHAR(100) NULL,

        CONSTRAINT UQ_Monitores_Serial UNIQUE (Serial),

        CONSTRAINT CK_Monitores_Estado
            CHECK (
                EstadoEquipo IN (
                    'Operativo',
                    'Inoperativo',
                    'Donado',
                    'Vendido',
                    'Stock'
                )
            )
    );
END;
GO


/* ============================================================
   TABLETS
   ============================================================ */

IF OBJECT_ID('dbo.Tablets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tablets
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        IMEI VARCHAR(15) NOT NULL,
        Serie VARCHAR(100) NOT NULL,
        Marca VARCHAR(100) NULL,
        Modelo VARCHAR(150) NULL,
        Caracteristicas VARCHAR(1000) NULL,
        EstadoEquipo VARCHAR(20) NOT NULL DEFAULT 'Stock',
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        IDTablet VARCHAR(100) NOT NULL,
        Kiosko VARCHAR(100) NULL,
        TabletReposicion VARCHAR(100) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,

        CONSTRAINT UQ_Tablets_IMEI UNIQUE (IMEI),
        CONSTRAINT UQ_Tablets_Serie UNIQUE (Serie),
        CONSTRAINT UQ_Tablets_IDTablet UNIQUE (IDTablet),

        CONSTRAINT CK_Tablets_IMEI
            CHECK (
                LEN(IMEI) = 15
                AND IMEI NOT LIKE '%[^0-9]%'
            ),

        CONSTRAINT CK_Tablets_Estado
            CHECK (
                EstadoEquipo IN (
                    'Operativo',
                    'Inoperativo',
                    'Donado',
                    'Vendido',
                    'Stock'
                )
            )
    );
END;
GO


/* ============================================================
   MODEMS
   ============================================================ */

IF OBJECT_ID('dbo.Modems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Modems
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        IMEI VARCHAR(20) NOT NULL,
        Serie VARCHAR(100) NOT NULL,
        Marca VARCHAR(100) NULL,
        Modelo VARCHAR(150) NULL,
        EstadoEquipo VARCHAR(20) NOT NULL DEFAULT 'Stock',
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        Observacion VARCHAR(2000) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,
        NombreRed VARCHAR(200) NULL,
        ContrasenaRed VARCHAR(500) NULL,

        CONSTRAINT UQ_Modems_IMEI UNIQUE (IMEI),
        CONSTRAINT UQ_Modems_Serie UNIQUE (Serie),

        CONSTRAINT CK_Modems_IMEI
            CHECK (IMEI NOT LIKE '%[^0-9]%'),

        CONSTRAINT CK_Modems_Estado
            CHECK (
                EstadoEquipo IN (
                    'Operativo',
                    'Inoperativo',
                    'Donado',
                    'Vendido',
                    'Stock'
                )
            )
    );
END;
GO


/* ============================================================
   CELULARES
   ============================================================ */

IF OBJECT_ID('dbo.Celulares', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Celulares
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        IMEI VARCHAR(20) NOT NULL,
        Marca VARCHAR(100) NULL,
        Modelo VARCHAR(150) NULL,
        Caracteristicas VARCHAR(1000) NULL,
        Serie VARCHAR(100) NOT NULL,
        EstadoEquipo VARCHAR(20) NOT NULL DEFAULT 'Stock',
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        Observacion VARCHAR(2000) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,

        CONSTRAINT UQ_Celulares_IMEI UNIQUE (IMEI),
        CONSTRAINT UQ_Celulares_Serie UNIQUE (Serie),

        CONSTRAINT CK_Celulares_IMEI
            CHECK (IMEI NOT LIKE '%[^0-9]%'),

        CONSTRAINT CK_Celulares_Estado
            CHECK (
                EstadoEquipo IN (
                    'Operativo',
                    'Inoperativo',
                    'Donado',
                    'Vendido',
                    'Stock'
                )
            )
    );
END;
GO


/* ============================================================
   CHIPS
   ============================================================ */

IF OBJECT_ID('dbo.Chips', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Chips
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Numero VARCHAR(9) NOT NULL,
        ICCID VARCHAR(22) NOT NULL,
        Operador VARCHAR(100) NULL,
        Uso VARCHAR(20) NOT NULL,
        Estado VARCHAR(20) NOT NULL,
        Area VARCHAR(150) NULL,
        Usuario VARCHAR(200) NULL,
        Lote VARCHAR(100) NULL,
        Ticket VARCHAR(100) NULL,
        Correo VARCHAR(200) NULL,
        Observaciones VARCHAR(2000) NULL,

        CONSTRAINT UQ_Chips_Numero UNIQUE (Numero),
        CONSTRAINT UQ_Chips_ICCID UNIQUE (ICCID),

        CONSTRAINT CK_Chips_Numero
            CHECK (
                LEN(Numero) = 9
                AND Numero NOT LIKE '%[^0-9]%'
            ),

        CONSTRAINT CK_Chips_ICCID
            CHECK (ICCID NOT LIKE '%[^0-9]%'),

        CONSTRAINT CK_Chips_Uso
            CHECK (Uso IN ('Datos', 'Voz')),

        CONSTRAINT CK_Chips_Estado
            CHECK (Estado IN ('Baja', 'Activa'))
    );
END;
GO


/* ============================================================
   USUARIOS DEL SISTEMA
   ============================================================ */

IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Nombres VARCHAR(150) NOT NULL,
        Apellidos VARCHAR(150) NOT NULL,
        Usuario VARCHAR(100) NOT NULL,
        Correo VARCHAR(200) NOT NULL,
        Rol VARCHAR(30) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,

        CONSTRAINT UQ_Usuarios_Usuario UNIQUE (Usuario),
        CONSTRAINT UQ_Usuarios_Correo UNIQUE (Correo),

        CONSTRAINT CK_Usuarios_Rol
            CHECK (Rol IN ('Administrador', 'Consultor'))
    );
END;
GO


/* ============================================================
   CREDENCIALES
   ============================================================ */

IF OBJECT_ID('dbo.UsuarioCredenciales', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UsuarioCredenciales
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        UsuarioId INT NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        Salt VARCHAR(255) NOT NULL,
        ActualizadoEn DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT UQ_UsuarioCredenciales_Usuario
            UNIQUE (UsuarioId),

        CONSTRAINT FK_UsuarioCredenciales_Usuarios
            FOREIGN KEY (UsuarioId)
            REFERENCES dbo.Usuarios(Id)
            ON DELETE CASCADE
    );
END;
GO

/* ============================================================
   TABLA DE ÁREAS
   ============================================================ */

   Drop table Areas
IF OBJECT_ID('dbo.Areas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Areas
    (
        Id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Areas PRIMARY KEY,

        Nombre VARCHAR(150) NOT NULL,

        Activo BIT NOT NULL
            CONSTRAINT DF_Areas_Activo DEFAULT 1,

        CONSTRAINT UQ_Areas_Nombre UNIQUE (Nombre)
    );
END;
GO


/* ============================================================
   CARGA INICIAL DE ÁREAS
   ============================================================ */

DECLARE @Areas TABLE
(
    Nombre VARCHAR(150)
);
go

INSERT INTO dbo.Areas (Nombre)
SELECT V.Nombre
FROM
(
    VALUES
        ('Gerencia'),
        ('Administración'),
        ('Tecnología de la Información'),
        ('Delivery Pacifico'),
        ('Legal'),
        ('GEP'),
        ('Ambulancia'),
        ('Pacifico Ejecutivas'),
        ('Pacifico CIC'),
        ('Pacifico Ventas'),
        ('Pacifico Chat'),
        ('SSO'),
        ('Honorarios Médicos'),
        ('Dr Online'),
        ('Call Médico'),
        ('Medicos a Domicilio'),
        ('Centro de Operaciones'),
        ('Servicios Asociados'),
        ('Contact Center'),
        ('Marketing'),
        ('Calidad y Procesos'),
        ('Finanzas'),
        ('Patrimonial'),
        ('Contabilidad'),
        ('Facturación'),
        ('Crónicos'),
        ('Telemedicina'),
        ('Melchorita'),
        ('Tsanna'),
        ('Almacen Farmacéutico'),
        ('CSO'),
        ('Tesorería'),
		('Centros Clínicos'),
		('Stock'),
        ('Almacén TI')
) AS V(Nombre)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Areas A
    WHERE A.Nombre = V.Nombre
);
GO


SELECT
    Id,
    Nombre,
    Activo
FROM dbo.Areas
ORDER BY Id;

SELECT COUNT(*) AS TotalAreas
FROM dbo.Areas;



SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

USE DRCore;
GO

SELECT
    Id,
    Nombre,
    Activo
FROM dbo.Areas
ORDER BY Nombre;
GO

CREATE TABLE Impresoras
(
    Id INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_Impresoras
        PRIMARY KEY,

    IpCompleta VARCHAR(50) NOT NULL,

    Nombre VARCHAR(150) NULL,

    Area VARCHAR(150) NULL,

    Ubicacion VARCHAR(200) NULL,

    Observacion VARCHAR(500) NULL,

    AreaAnterior VARCHAR(150) NULL,

    CONSTRAINT UQ_Impresoras_IpCompleta
        UNIQUE (IpCompleta)
);

 CREATE TABLE VPN
(
    Id INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_VPN
        PRIMARY KEY,

    NombresCompletos VARCHAR(200) NOT NULL,

    Usuario VARCHAR(150) NOT NULL,

    Correo VARCHAR(200) NOT NULL,

    Area VARCHAR(150) NOT NULL,

    JefeAutorizador VARCHAR(200) NOT NULL,

    TipoVPN VARCHAR(20) NOT NULL,

    Estado VARCHAR(20) NOT NULL,

    Forti VARCHAR(20) NOT NULL,

    LastUser VARCHAR(200) NULL,

    CONSTRAINT UQ_VPN_Usuario
        UNIQUE (Usuario),

    CONSTRAINT CK_VPN_TipoVPN
        CHECK (
            TipoVPN IN (
                'Forti',
                'WEB'
            )
        ),

    CONSTRAINT CK_VPN_Estado
        CHECK (
            Estado IN (
                'Asignado',
                'Reserva'
            )
        ),

    CONSTRAINT CK_VPN_Forti
        CHECK (
            Forti IN (
                'Activo',
                'Desactivado'
            )
        )
);

CREATE TABLE Ips
(
    Id INT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_Ips
        PRIMARY KEY,

    Segmento VARCHAR(10) NOT NULL,

    Ip VARCHAR(45) NOT NULL,

    HostName VARCHAR(150) NULL,

    Usuario VARCHAR(200) NULL,

    Area VARCHAR(150) NULL,

    Ubicacion VARCHAR(200) NULL,

    Oficina VARCHAR(150) NULL,

    Observacion VARCHAR(500) NULL,

    CONSTRAINT UQ_Ips_Ip
        UNIQUE (Ip),

    CONSTRAINT CK_Ips_Segmento
        CHECK (
            Segmento IN (
                '26',
                '46',
                '56',
                '100'
            )
        )
);