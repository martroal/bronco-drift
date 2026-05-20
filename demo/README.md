# Demo data

CSVs de ejemplo para mostrar los módulos llenos de data sin tener que cargar a mano. Útiles para:

- Grabación de videos (wow moment del bulk import).
- Pruebas de UI sin Supabase real.
- Onboarding de nuevos usuarios que quieren ver cómo se ve la app con data.

Los datos son ficticios. CUITs construidos para tener 11 dígitos válidos, NO corresponden a personas o empresas reales.

## Archivos

| Archivo | Módulo | Contenido |
|---|---|---|
| `contadores-ejemplo.csv` | Vencet (contadores) | 10 clientes argentinos + 30 obligaciones distribuidas en mayo-septiembre 2026. Mezcla de impuestos reales (IVA, Ganancias, Monotributo, IIBB CABA/Bs As, F. 931 SICOSS, Retenciones SICORE, Bienes Personales, Autónomos). Fechas en formato ISO y DD/MM/YYYY para validar el parser flexible. Distribución de proximidad pensada para que el panel quede colorido: vencidos en rojo, esta semana en amarillo, próximas semanas en verde. |

## Cómo usar

1. Abrir el módulo correspondiente (ej `/contadores/app`).
2. Iniciar sesión (o crear cuenta).
3. Click "Importar CSV".
4. Subir el archivo correspondiente desde esta carpeta.
5. Preview confirma 30 filas válidas, 0 errores. Click "Confirmar 30 filas".
6. El panel se llena en un segundo.
