# 🧭 Flujo de Trabajo con Ramas en GitHub

Este documento explica el flujo estándar que usamos para mantener el código ordenado, evitar conflictos y poder hacer rollback sin dramas 😎.  
Está pensado para equipos pequeños o medianos que trabajan con ramas y *Pull Requests*.

---

## 💡 Objetivo

Mantener el proyecto **estable en `main`** mientras se permite desarrollar nuevas funcionalidades o arreglos sin romper nada.

Cada **rama (branch)** es una copia del proyecto donde se puede trabajar libremente.  
El `main` representa la **versión oficial y estable**.

---


## 🔁 Diagrama del Flujo Completo (GitHub Workflow)

Este diagrama muestra el flujo estándar de trabajo con ramas (branches) en GitHub, incluyendo los pasos para desarrollo, revisión, merge y rollback.

---


## 🪜 Flujo paso a paso

### 1️⃣ Crear una nueva rama desde `main`

Crea tu propia copia del proyecto actualizada, sin riesgo de romper lo que ya está funcionando.

```bash
git checkout main
git pull origin main
git checkout -b feature/nueva-funcion
```

### 2️⃣ Traer los últimos cambios

Así te aseguras de trabajar con la versión más reciente antes de empezar.

```bash
git fetch origin main
```

### 3️⃣ Editar, probar y commitear

Aquí desarrollas todo lo necesario y haces pruebas locales.
No pasa nada si rompes algo: los cambios quedan solo en tu rama.

```bash
git add .
git commit -m "Agrego nueva funcionalidad X"
```

### 4️⃣ Subir la rama al repositorio remoto

Esto deja la rama visible en GitHub y lista para crear un Pull Request.

```bash
git push origin feature/nueva-funcion
```

### 5️⃣ Crear un Pull Request (PR)

En GitHub:

- Comparar tu rama con main.
- Escribir una descripción clara.
- Asignar revisores si es necesario.

El PR sirve como punto de control y rollback.
Si algo falla después, puedes volver fácilmente a este estado.

### 6️⃣ Revisar y aprobar el PR

Antes de hacer el merge:

- Revisa que no haya conflictos.
- Prueba que el sistema no se rompa.
- Confirma que el código esté pulido.

Este paso es clave.
Si se aprueba sin revisar, puede quedar la escoba 😅.

### 7️⃣ Hacer merge al main

En GitHub:

- Merge pull request → Confirm merge

El cambio pasa oficialmente al proyecto principal (main).

### 8️⃣ Eliminar la rama

Mantiene el repositorio limpio y evita ramas viejas colgando.

```bash
git branch -d feature/nueva-funcion
git push origin --delete feature/nueva-funcion
```

### 9️⃣ (Opcional) Crear un punto de rollback

Sirve para marcar versiones estables y poder volver atrás si algo falla.

```bash
git tag -a v1.2.3 -m "Versión estable antes del cambio X"
git push origin v1.2.3
```


⚙️ Buenas prácticas

❌ No trabajar directo en main.

🔄 Actualizar siempre la rama antes de mergear.

🧱 Usar nombres claros para las ramas:

feature/crear-login

fix/error-en-api

hotfix/reporte-crash

🧹 Borrar ramas antiguas.



```mermaid
flowchart TD

A([🚀 Inicio: main actualizado]) --> B([🌱 Crear nueva rama<br/>git checkout -b feature/nueva-funcion])
B --> C([📡 git fetch origin main<br/>Traer últimos cambios del remoto])
C --> D([💻 Editar código<br/>y probar que no se rompa nada])
D --> E([🧩 Hacer commits locales<br/>git add . && git commit -m "Cambios"])
E --> F([⬆️ Subir rama<br/>git push origin feature/nueva-funcion])
F --> G([🔀 Crear Pull Request en GitHub])
G --> H([🧪 Revisión y pruebas del PR])
H --> I{✅ ¿Todo bien?}
I -->|Sí| J([📦 Merge al main<br/>Confirmar Pull Request])
I -->|No| K([♻️ Rollback o corrección<br/>en la misma rama])
J --> L([🧹 Eliminar rama<br/>git branch -d && git push --delete])
J --> M([🏷️ Tag opcional<br/>git tag -a v1.2.3])
M --> N([💾 Backup / punto de rollback listo ✅])
K --> D

%% 🎨 Estilos personalizados
style A fill:#198754,stroke:#0f5132,color:#fff
style B fill:#157347,stroke:#0f5132,color:#fff
style C fill:#0d6efd,stroke:#052c65,color:#fff
style D fill:#0dcaf0,stroke:#055160,color:#000
style E fill:#20c997,stroke:#0f5132,color:#000
style F fill:#0d6efd,stroke:#052c65,color:#fff
style G fill:#6f42c1,stroke:#2d0c57,color:#fff
style H fill:#ffc107,stroke:#664d03,color:#000
style I fill:#fd7e14,stroke:#662b00,color:#000
style J fill:#198754,stroke:#0f5132,color:#fff
style K fill:#dc3545,stroke:#58151c,color:#fff
style L fill:#6c757d,stroke:#212529,color:#fff
style M fill:#0dcaf0,stroke:#055160,color:#000
style N fill:#2f80ed,stroke:#0a58ca,color:#fff