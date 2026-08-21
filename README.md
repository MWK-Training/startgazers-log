# startgazers-log
Un registro de los repositorios que he marcado con una estrella.

## Ambientes

El sitio se organiza en dos ambientes dentro de GitHub Pages:

- Staging: `/startgazers-log/staging/`
- Produccion: `/startgazers-log/production/`

## Flujo Git

- `develop`: rama de integracion. Cada push ejecuta CI y despliega el estado actual en staging.
- `main`: rama de produccion. Se actualiza mediante un pull request aprobado desde `develop` y despliega production.
- `feature/*`: ramas de trabajo que deben entrar por pull request hacia `develop`.

El workflow de Pages publica ambas carpetas en cada ejecucion. El ambiente de GitHub Actions cambia segun la rama: `staging` para `develop` y `production` para `main`.

Para hacer manual la promocion a produccion, configura en GitHub:

1. Una regla de proteccion para `main` que requiera pull request y aprobacion.
2. Un Environment llamado `production` con revisores requeridos.
3. Un Environment llamado `staging` sin aprobacion obligatoria.

El workflow de CI valida JavaScript, JSON y la estructura de ambos ambientes en pull requests y pushes.

Develop