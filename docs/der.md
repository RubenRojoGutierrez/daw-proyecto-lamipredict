```mermaid
erDiagram
    USUARIO ||--o{ LOTE : "registra"
    LOTE ||--o{ TELEMETRIA : "genera"
    LOTE ||--o{ REGISTRO_CALIDAD : "tiene"
    DEFECTO ||--o{ REGISTRO_CALIDAD : "aparece en"

    USUARIO {
        int id_usuario PK
        string nombre
        string email
        string password_hash
        string rol
    }
    PIEZA {

        string id_pieza PK
        int id_usuario FK
        int programa_fabricacion
        int numero_carro
        datetime timestamp

    }
    DEFECTO {
        int id_defecto PK
        string nombre
        string descripcion
    }
    TELEMETRIA {
        int id_telemetria PK
        int id_lote FK
        datetime timestamp
        string receta_fabricacion
        decimal temp_vidrio
        decimal velocidad_lavadora
        decimal temp_agua_lavadora
        decimal temp_vidrio_entrada_ensamblado
        decimal temp_ensamblado
        decimal humedad_ensamblado
        string lote_pvb
        decimal presion_calandra_1
        decimal presion_calandra_2
        decimal temp_horno
        int resistances_encendidas
        decimal temp_vidrio_salida_horno
        decimal cantidad_intercalario
    }
    REGISTRO_CALIDAD {
        int id_registro PK
        int id_lote FK
        int id_defecto FK
        string gravedad
        string observaciones
    }
