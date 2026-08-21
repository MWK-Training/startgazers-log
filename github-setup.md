# Configuracion de GitHub

Esta guia documenta el flujo de ramas, validacion y despliegue del proyecto `startgazers-log`.

## Estructura de ambientes

El sitio mantiene una copia independiente para cada ambiente:

```text
environments/
├── staging/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── events.json
└── production/
    ├── index.html
    ├── script.js
    ├── style.css
    └── events.json
```

GitHub Pages publica ambas carpetas con estas rutas:

```text
https://<usuario>.github.io/startgazers-log/staging/
https://<usuario>.github.io/startgazers-log/production/
```

Reemplaza `<usuario>` por el propietario del repositorio.

## Flujo de ramas

```text
feature/* -> pull request -> develop -> staging
                              |
                   pull request aprobado
                              v
                            main -> production
```

- `feature/*`: rama de trabajo para una funcionalidad o cambio.
- `develop`: rama de integracion. Cada push ejecuta CI y despliega el estado en staging.
- `main`: rama de produccion. Solo debe actualizarse mediante un pull request aprobado desde `develop`.

Crear una rama de trabajo:

```bash
git switch develop
git pull origin develop
git switch -c feature/nombre-del-cambio
```

Subir una rama y abrir un pull request:

```bash
git push -u origin feature/nombre-del-cambio
```

El pull request debe dirigirse a `develop`.

## Workflows

### CI

Archivo: `.github/workflows/ci.yml`

El workflow `CI` se ejecuta en pull requests y pushes hacia `develop` o `main`.

El job se llama `validate`, por lo que GitHub muestra el check como:

```text
CI / validate
```

Este job:

- Instala Node.js 22.
- Comprueba la sintaxis JavaScript de staging y production.
- Valida los dos archivos `events.json`.
- Comprueba que existan los archivos HTML y CSS de ambos ambientes.

### Validacion del nombre de rama

Archivo: `.github/workflows/branch-name.yml`

El workflow `Validate branch name` se ejecuta en pull requests hacia `develop`. La rama de origen debe usar uno de estos prefijos:

```text
feature/*
fix/*
hotfix/*
```

El job se llama `branch-name`, por lo que el check aparece como:

```text
Validate branch name / branch-name
```

Ejemplos validos:

```text
feature/adding-labels-for-branches
fix/events-json
hotfix/production-deploy
```

Ejemplos no validos:

```text
bugfix/events-json
test/experiment
adding-labels-for-branches
```

### Despliegue

Archivo: `.github/workflows/deploy.yml`

El workflow `Deploy environments to GitHub Pages` se ejecuta:

- Cuando un pull request se fusiona en `develop`.
- Cuando un pull request se fusiona en `main`.
- Manualmente mediante `Actions > Deploy environments to GitHub Pages > Run workflow`.

No se ejecuta por un push directo. La regla de proteccion de la rama debe impedir ese push; si alguien consigue realizarlo, tampoco publicara un ambiente porque el workflow solo acepta pull requests fusionados o una ejecucion manual.

El ambiente de GitHub Actions se selecciona automáticamente:

```yaml
develop -> staging
main    -> production
```

El workflow construye un artefacto con esta estructura antes de publicarlo:

```text
public/
├── staging/
└── production/
```

## Configuracion de GitHub

### 1. GitHub Pages

En el repositorio:

1. Abre `Settings > Pages`.
2. En `Build and deployment`, selecciona `GitHub Actions` como fuente.
3. Espera a que termine correctamente un despliegue desde `develop` o `main`.

### 2. Environment `staging`

En `Settings > Environments`:

1. Selecciona `New environment`.
2. Crea un ambiente llamado exactamente `staging`.
3. No agregues revisores obligatorios.
4. En `Deployment branches and tags`, selecciona `Selected branches and tags`.
5. Permite únicamente la rama `develop`.

### 3. Environment `production`

En `Settings > Environments`:

1. Crea un ambiente llamado exactamente `production`.
2. En `Required reviewers`, agrega a los revisores autorizados.
3. En `Deployment branches and tags`, selecciona `Selected branches and tags`.
4. Permite únicamente la rama `main`.

Cuando un despliegue de `main` llegue al job de production, GitHub lo pausara hasta que un revisor lo apruebe.

### 4. Proteccion de `develop`

En `Settings > Branches` crea una regla o ruleset para `develop` con estas opciones:

- Requerir pull request antes de fusionar.
- Requerir aprobacion, si hay otro colaborador disponible.
- Requerir que los checks pasen antes de fusionar.
- Seleccionar el check `CI / validate`.
- Seleccionar el check `Validate branch name / branch-name`.
- Bloquear force pushes.
- Bloquear la eliminacion de la rama.

El check `Validate branch name / branch-name` aparece despues de crear o actualizar un pull request hacia `develop`. Configuralo como requisito en la regla de `develop`; la regla de proteccion es la que impide realmente los pushes directos.

### 5. Proteccion de `main`

En `Settings > Branches` crea una regla o ruleset para `main` con estas opciones:

- Requerir pull request antes de fusionar.
- Requerir al menos una aprobacion.
- Descartar aprobaciones obsoletas cuando cambien los commits.
- Requerir que los checks pasen antes de fusionar.
- Seleccionar el check `CI / validate`.
- Bloquear force pushes.
- Bloquear la eliminacion de la rama.

El check `CI / validate` puede seleccionarse despues de que el workflow `CI` haya ejecutado al menos una vez en GitHub.

## Promover a produccion

1. Trabaja en una rama `feature/*`.
2. Abre un pull request hacia `develop`.
3. Espera a que `CI / validate` termine correctamente.
4. Fusiona el pull request en `develop`.
5. Comprueba staging en `/staging/`.
6. Abre un pull request desde `develop` hacia `main`.
7. Espera la aprobacion requerida y el check `CI / validate`.
8. Fusiona el pull request en `main`.
9. GitHub Actions ejecutara el despliegue de production.

Despues de fusionar un pull request, actualiza tus referencias locales:

```bash
git fetch origin
git switch develop
git pull origin develop
```

Para comenzar el siguiente cambio, crea una nueva rama desde `develop`:

```bash
git switch -c feature/nuevo-cambio
```

## Trabajo individual

GitHub no permite aprobar el propio pull request. Si el repositorio tiene un unico mantenedor y no hay otro usuario que pueda aprobar, hay dos alternativas:

- Mantener una aprobacion obligatoria y agregar un colaborador con permiso `Write`, `Maintain` o `Admin`.
- Cambiar el numero de aprobaciones requeridas a `0`, manteniendo obligatorio el check `CI / validate`.

Para un equipo, se recomienda mantener al menos una aprobacion.

## Nota sobre GitHub Pages

GitHub Pages publica un unico artefacto por despliegue. En este proyecto, tanto el despliegue desde `develop` como el de `main` contiene las carpetas `staging` y `production`.

Los Environments `staging` y `production` controlan las reglas y aprobaciones del workflow, pero no crean dos servidores aislados. La separacion visible se realiza mediante las rutas:

```text
/staging/
/production/
```
