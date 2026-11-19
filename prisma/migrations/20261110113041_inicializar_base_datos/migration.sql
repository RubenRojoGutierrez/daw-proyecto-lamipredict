-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Maquina" (
    "id_maquina" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id_maquina")
);

-- CreateTable
CREATE TABLE "Pieza" (
    "id_pieza" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "programa_fabricacion" INTEGER NOT NULL,
    "numero_carro" INTEGER NOT NULL,
    "lote_vidrio_base" TEXT NOT NULL,
    "lote_pvb" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pieza_pkey" PRIMARY KEY ("id_pieza")
);

-- CreateTable
CREATE TABLE "Defecto" (
    "id_defecto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Defecto_pkey" PRIMARY KEY ("id_defecto")
);

-- CreateTable
CREATE TABLE "Telemetria" (
    "id_telemetria" SERIAL NOT NULL,
    "id_pieza" TEXT NOT NULL,
    "id_maquina" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receta_fabricacion" TEXT NOT NULL,
    "temp_vidrio_base" DOUBLE PRECISION NOT NULL,
    "velocidad_lavadora" DOUBLE PRECISION NOT NULL,
    "temp_agua_lavadora" DOUBLE PRECISION NOT NULL,
    "temp_entrada_sala_blanca" DOUBLE PRECISION NOT NULL,
    "temp_ensamblado" DOUBLE PRECISION NOT NULL,
    "humedad_ensamblado" DOUBLE PRECISION NOT NULL,
    "presion_calandra_1" DOUBLE PRECISION NOT NULL,
    "presion_calandra_2" DOUBLE PRECISION NOT NULL,
    "temp_horno" DOUBLE PRECISION NOT NULL,
    "resistencias_encendidas" INTEGER NOT NULL,
    "temp_salida_horno" DOUBLE PRECISION NOT NULL,
    "cantidad_polvo_intercalario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Telemetria_pkey" PRIMARY KEY ("id_telemetria")
);

-- CreateTable
CREATE TABLE "RegistroCalidad" (
    "id_registro" SERIAL NOT NULL,
    "id_pieza" TEXT NOT NULL,
    "id_defecto" INTEGER NOT NULL,
    "gravedad" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "RegistroCalidad_pkey" PRIMARY KEY ("id_registro")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Pieza" ADD CONSTRAINT "Pieza_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetria" ADD CONSTRAINT "Telemetria_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza"("id_pieza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetria" ADD CONSTRAINT "Telemetria_id_maquina_fkey" FOREIGN KEY ("id_maquina") REFERENCES "Maquina"("id_maquina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCalidad" ADD CONSTRAINT "RegistroCalidad_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza"("id_pieza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCalidad" ADD CONSTRAINT "RegistroCalidad_id_defecto_fkey" FOREIGN KEY ("id_defecto") REFERENCES "Defecto"("id_defecto") ON DELETE RESTRICT ON UPDATE CASCADE;
