```mermaid
erDiagram
    USUARIO ||--o{ PIEZA : "supervisa"
    PIEZA ||--o{ TELEMETRIA : "recibe"
    MAQUINA ||--o{ TELEMETRIA : "genera"
    PIEZA ||--o{ REGISTRO_CALIDAD : "tiene"
    DEFECTO ||--o{ REGISTRO_CALIDAD : "aparece en"

    USUARIO {
        int id_usuario PK
        string nombre
        string email
        string password_hash
        string rol
    }
    MAQUINA {
        int id_maquina PK
        string nombre
        string seccion
    }
    PIEZA {
        string id_pieza PK
        int id_usuario FK
        int programa_fabricacion
        int numero_carro
        string lote_vidrio_base
        string lote_pvb
        datetime timestamp
    }
    DEFECTO {
        int id_defecto PK
        string nombre
        string descripcion
    }
    TELEMETRIA {
        int id_telemetria PK
        string id_pieza FK
        int id_maquina FK
        datetime timestamp
        string receta_fabricacion
        decimal temp_vidrio_base
        decimal velocidad_lavadora
        decimal temp_agua_lavadora
        decimal temp_entrada_sala_blanca
        decimal temp_ensamblado
        decimal humedad_ensamblado
        decimal presion_calandra_1
        decimal presion_calandra_2
        decimal temp_horno
        int resistencias_encendidas
        decimal temp_salida_horno
        decimal cantidad_polvo_intercalario
    }
    REGISTRO_CALIDAD {
        int id_registro PK
        string id_pieza FK
        int id_defecto FK
        string gravedad
        string observaciones
    }
