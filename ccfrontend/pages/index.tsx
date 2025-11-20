import mermaid from 'mermaid';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

import { useAuth } from '@/lib/useAuth';
import { validateIdentifier, formatIdentifier } from '@/lib/validators';

const diagrams = [
	{
		title: 'Flujo Principal (Viaje del Usuario)',
		code: `sequenceDiagram
          participant Admin
          participant Sistema
          participant Residente
          participant Pasarela de pago

          Admin->>Sistema: Carga Gasto (Factura Luz)
          Sistema->>Sistema: Calcula Prorrateo (Alicuotas)
          Sistema->>Residente: Notifica Cobro (Email)
          Residente->>Sistema: Visualiza Deuda en App
          Residente->>Pasarela de pago: Realiza Pago Web
          Pasarela de pago->>Sistema: Webhook (Pago Exitoso)
          Sistema->>Sistema: Conciliación Automática
          Sistema->>Admin: Actualiza Dashboard Financiero`,
	},
	{
		title: 'Arquitectura del Sistema',
		code: `flowchart TB
          classDef front fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a8a
          classDef back fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
          classDef data fill:#dcfce7,stroke:#166534,stroke-width:2px,color:#14532d
          classDef ext fill:#f3f4f6,stroke:#4b5563,stroke-width:2px,stroke-dasharray: 5 5,color:#374151

          U[Usuario / Navegador]

          subgraph EXTERNAL["Servicios externos"]
          direction TB
          PAYMENT[Pasarela de pagos / Webhooks]:::ext
          SMTP[Proveedor SMTP / Email]:::ext
          end

          subgraph CLOUD["Nube"]
          direction TB
          subgraph EDGE["Edge / Gateway"]
          direction LR
          NGINX[Nginx - reverse proxy / CDN]:::front
          FE[Frontend - Next.js / React]:::front
          end
          subgraph BACKEND["Backend / API"]
          direction LR
          API["API - Node.js / Express\n(Sequelize)"]:::back
          WORKERS[Workers / Background Jobs]:::back
          end
          subgraph INFRA["Infra: DB / Cache / Storage"]
          direction LR
          REDIS[(Redis)]:::data
          STORAGE[(Uploads / Object Storage)]:::data
          A1([ ])
          A2([ ])
          MYSQL[(MySQL 8.0\nInnoDB)]:::data
          PHPMY[phpMyAdmin]:::data
          end
          end

          U --> NGINX
          NGINX --> FE
          FE --> API
          PAYMENT --> API
          SMTP --> API
          API --> WORKERS
          API --> REDIS
          WORKERS --> REDIS
          API --> STORAGE
          WORKERS --> STORAGE
          API --> A1 --> A2 --> MYSQL
          PHPMY --> MYSQL
          WORKERS -.-> MYSQL`,
	},
	{
		title: 'Diagrama Principal (ER)',
		code: `erDiagram
          PERSONA { int id string rut string nombres string apellidos string email }
          USUARIO { int id int persona_id string username string password boolean activo }
          ROL { int id string codigo string nombre int nivel_acceso }
          USUARIO_COMUNIDAD_ROL { int id int usuario_id int comunidad_id int rol_id string desde string hasta boolean
          activo }
          COMUNIDAD { int id string razon_social string email_contacto }
          EDIFICIO { int id int comunidad_id string nombre }
          UNIDAD { int id int edificio_id string codigo }
          TITULARES_UNIDAD { int id int unidad_id int persona_id string tipo }
          EMISION_GASTOS_COMUNES { int id int comunidad_id string periodo string fecha_vencimiento }
          DETALLE_EMISION_GASTOS { int id int emision_id int gasto_id number monto }
          CUENTA_COBRO_UNIDAD { int id int emision_id int unidad_id number monto_total string estado }
          DETALLE_CUENTA_UNIDAD { int id int cuenta_cobro_unidad_id int categoria_id number monto }
          GASTO { int id int comunidad_id number monto }
          DOCUMENTO_COMPRA { int id int gasto_id number total }
          PAGO { int id int cuenta_cobro_unidad_id number monto string medio }
          MULTA { int id int unidad_id int persona_id number monto }
          AMENIDAD { int id int comunidad_id string nombre }
          RESERVA_AMENIDAD { int id int amenidad_id int unidad_id string estado }
          MEDIDOR { int id int unidad_id string tipo }
          LECTURA_MEDIDOR { int id int medidor_id string fecha number lectura }
          ARCHIVO { int id string entity_type int entity_id string file_path }
          PERSONA ||--o{ USUARIO : "crea/tiene"
          USUARIO ||--o{ USUARIO_COMUNIDAD_ROL : "asignaciones"
          ROL ||--o{ USUARIO_COMUNIDAD_ROL : "rol_asignado"
          COMUNIDAD ||--o{ EDIFICIO : "contiene"
          EDIFICIO ||--o{ UNIDAD : "contiene"
          UNIDAD ||--o{ TITULARES_UNIDAD : "titulares"
          EMISION_GASTOS_COMUNES ||--o{ DETALLE_EMISION_GASTOS : "incluye"
          GASTO ||--o{ DETALLE_EMISION_GASTOS : "desglosa"
          EMISION_GASTOS_COMUNES ||--o{ CUENTA_COBRO_UNIDAD : "genera"
          CUENTA_COBRO_UNIDAD ||--o{ DETALLE_CUENTA_UNIDAD : "items"
          CUENTA_COBRO_UNIDAD ||--o{ PAGO : "recibe"
          UNIDAD ||--o{ CUENTA_COBRO_UNIDAD : "tiene"
          UNIDAD ||--o{ MEDIDOR : "tiene"
          MEDIDOR ||--o{ LECTURA_MEDIDOR : "registra"
          AMENIDAD ||--o{ RESERVA_AMENIDAD : "reserva"
          UNIDAD ||--o{ RESERVA_AMENIDAD : "reserva_por"
          UNIDAD ||--o{ MULTA : "puede_tener"
          PERSONA ||--o{ MULTA : "sujeto"`,
	},
	{
		title: 'Módulo 01 · Comunidades',
		code: `erDiagram
          COMUNIDAD { bigint id PK varchar codigo UK varchar nombre varchar razon_social varchar email_contacto }
          PARAMETRO { bigint id PK bigint comunidad_id FK varchar clave varchar valor }
          CENTRO_COSTO { bigint id PK bigint comunidad_id FK varchar codigo UK varchar nombre }
          CATEGORIA { bigint id PK bigint comunidad_id FK varchar codigo varchar nombre }
          ALIQUOTA { bigint id PK bigint comunidad_id FK decimal porcentaje varchar descripcion }
          COMUNIDAD ||--o{ PARAMETRO : "tiene"
          COMUNIDAD ||--o{ CENTRO_COSTO : "contiene"
          COMUNIDAD ||--o{ CATEGORIA : "contiene"
          COMUNIDAD ||--o{ ALIQUOTA : "define"
          CENTRO_COSTO ||--o{ CATEGORIA : "clasifica"`,
	},
	{
		title: 'Módulo 02 · Usuarios y Seguridad',
		code: `erDiagram
          PERSONA { bigint id PK varchar rut UK char dv varchar nombres varchar apellidos varchar email varchar telefono
          }
          USUARIO { bigint id PK bigint persona_id FK varchar username UK varchar hash_password tinyint totp_enabled
          datetime created_at datetime last_login }
          ROL { int id PK varchar codigo UK varchar nombre int nivel_acceso tinyint es_sistema }
          COMUNIDAD { int id PK varchar nombre varchar razon_social }
          USUARIO_COMUNIDAD_ROL { bigint id PK bigint usuario_id FK bigint comunidad_id FK int rol_id FK tinyint activo
          date desde date hasta }
          AUDITORIA { bigint id PK bigint usuario_id FK varchar accion datetime fecha text detalle }
          SESION_USUARIO { bigint id PK bigint usuario_id FK varchar token datetime created_at datetime expires_at
          varchar ip varchar user_agent }
          PERSONA ||--o{ USUARIO : "crea/tiene"
          USUARIO ||--o{ USUARIO_COMUNIDAD_ROL : "asignaciones"
          ROL ||--o{ USUARIO_COMUNIDAD_ROL : "rol_asignado"
          COMUNIDAD ||--o{ USUARIO_COMUNIDAD_ROL : "pertenece"
          USUARIO ||--o{ AUDITORIA : "registra"
          USUARIO ||--o{ SESION_USUARIO : "sesiones"`,
	},
	{
		title: 'Módulo 03 · Estructura',
		code: `erDiagram
          EDIFICIO { bigint id PK bigint comunidad_id FK varchar nombre varchar direccion }
          TORRE { bigint id PK bigint edificio_id FK varchar nombre }
          UNIDAD { bigint id PK bigint edificio_id FK bigint torre_id FK varchar codigo UK decimal alicuota }
          TITULAR { bigint id PK bigint unidad_id FK bigint persona_id FK varchar tipo }
          COMUNIDAD ||--o{ EDIFICIO : "contiene"
          EDIFICIO ||--o{ TORRE : "contiene"
          EDIFICIO ||--o{ UNIDAD : "contiene"
          TORRE ||--o{ UNIDAD : "tiene"
          UNIDAD ||--o{ TITULAR : "titulares"
          COMUNIDAD ||--o{ UNIDAD : "condominio"`,
	},
	{
		title: 'Módulo 04 · Gestión Financiera',
		code: `erDiagram
          PROVEEDOR { bigint id PK varchar rut UK varchar nombre varchar email }
          DOCUMENTO_COMPRA { bigint id PK bigint proveedor_id FK varchar tipo varchar numero decimal total date fecha }
          GASTO { bigint id PK bigint documento_compra_id FK bigint comunidad_id FK decimal monto int categoria_id FK }
          CATEGORIA_CONTABLE { int id PK varchar codigo varchar nombre }
          ASIENTO { bigint id PK bigint gasto_id FK date fecha text detalle }
          PROVEEDOR ||--o{ DOCUMENTO_COMPRA : "emite"
          DOCUMENTO_COMPRA ||--o{ GASTO : "origina"
          GASTO ||--o{ ASIENTO : "genera"
          CATEGORIA_CONTABLE ||--o{ GASTO : "clasifica"`,
	},
	{
		title: 'Módulo 05 · Cobros y Pagos',
		code: `erDiagram
          EMISION_GASTOS_COMUNES { bigint id PK bigint comunidad_id FK varchar periodo date fecha_vencimiento }
          DETALLE_EMISION { bigint id PK bigint emision_id FK int categoria_id FK decimal monto }
          CUENTA_COBRO_UNIDAD { bigint id PK bigint emision_id FK bigint unidad_id FK decimal monto_total varchar estado
          }
          DETALLE_CUENTA { bigint id PK bigint cuenta_cobro_unidad_id FK int categoria_id FK decimal monto }
          PAGO { bigint id PK bigint cuenta_cobro_unidad_id FK decimal monto varchar medio date fecha }
          CONCILIACION { bigint id PK bigint pago_id FK varchar banco date fecha varchar estado }
          EMISION_GASTOS_COMUNES ||--o{ DETALLE_EMISION : "incluye"
          EMISION_GASTOS_COMUNES ||--o{ CUENTA_COBRO_UNIDAD : "genera"
          CUENTA_COBRO_UNIDAD ||--o{ DETALLE_CUENTA : "items"
          CUENTA_COBRO_UNIDAD ||--o{ PAGO : "recibe"
          PAGO ||--o{ CONCILIACION : "conciliacion"`,
	},
	{
		title: 'Módulo 05.1 · Multas',
		code: `erDiagram
          MULTA { bigint id PK bigint comunidad_id FK bigint unidad_id FK bigint persona_id FK varchar motivo decimal
          monto enum estado datetime fecha datetime fecha_pago }
          DOCUMENTO_MULTA { bigint id PK bigint multa_id FK varchar nombre varchar ruta varchar tipo }
          APELACION { bigint id PK bigint multa_id FK bigint persona_id FK varchar estado text detalle datetime
          creado_en }
          UNIDAD { bigint id PK int edificio_id int torre_id varchar codigo decimal alicuota }
          PERSONA { bigint id PK varchar rut varchar nombres varchar apellidos varchar email }
          CUENTA_COBRO_UNIDAD { bigint id PK bigint emision_id FK bigint unidad_id FK decimal monto_total varchar estado
          }
          DETALLE_CUENTA_UNIDAD { bigint id PK bigint cuenta_cobro_unidad_id FK int categoria_id FK decimal monto enum
          origen bigint origen_id }
          PAGO { bigint id PK bigint cuenta_cobro_unidad_id FK decimal monto varchar medio date fecha }

          MULTA ||--o{ DOCUMENTO_MULTA : "evidencias"
          MULTA ||--o{ APELACION : "apelaciones"
          UNIDAD ||--o{ MULTA : "genera"
          PERSONA ||--o{ MULTA : "sujeto"
          MULTA ||--o{ DETALLE_CUENTA_UNIDAD : "se_refleja_en"
          CUENTA_COBRO_UNIDAD ||--o{ DETALLE_CUENTA_UNIDAD : "items"
          CUENTA_COBRO_UNIDAD ||--o{ PAGO : "recibe"`,
	},
	{
		title: 'Módulo 06 · Amenidades',
		code: `erDiagram
          AMENIDAD { bigint id PK bigint comunidad_id FK varchar nombre text descripcion }
          TARIFA_AMENIDAD { bigint id PK bigint amenidad_id FK decimal precio varchar periodo }
          RESERVA_AMENIDAD { bigint id PK bigint amenidad_id FK bigint unidad_id FK date fecha_inicio date fecha_fin
          varchar estado }
          BLOQUEO { bigint id PK bigint amenidad_id FK date desde date hasta varchar motivo }
          AMENIDAD ||--o{ TARIFA_AMENIDAD : "tiene"
          AMENIDAD ||--o{ RESERVA_AMENIDAD : "recibe"
          AMENIDAD ||--o{ BLOQUEO : "bloquea"
          UNIDAD ||--o{ RESERVA_AMENIDAD : "reserva_por"`,
	},
	{
		title: 'Módulo 07 · Soporte',
		code: `erDiagram
          TICKET { bigint id PK bigint unidad_id FK bigint usuario_reporta_id FK varchar asunto text descripcion varchar
          estado datetime creado_en }
          TICKET_COMENTARIO { bigint id PK bigint ticket_id FK bigint usuario_id FK text comentario datetime creado_en }
          MANTENCION { bigint id PK bigint ticket_id FK date fecha_programada varchar responsable varchar estado }
          SLA { int id PK varchar nombre int horas_respuesta }
          UNIDAD ||--o{ TICKET : "genera"
          TICKET ||--o{ TICKET_COMENTARIO : "tiene"
          TICKET ||--o{ MANTENCION : "asocia"
          SLA ||--o{ TICKET : "aplica"`,
	},
	{
		title: 'Módulo 08 · Reportes',
		code: `erDiagram
          DASHBOARD { bigint id PK bigint comunidad_id FK varchar nombre text configuracion }
          KPI { bigint id PK bigint dashboard_id FK varchar codigo varchar descripcion decimal valor }
          REPORTE_PROGRAMADO { bigint id PK bigint comunidad_id FK varchar tipo varchar schedule varchar formato }
          EXPORTACION { bigint id PK bigint reporte_programado_id FK datetime generado_en varchar ruta_archivo }
          DASHBOARD ||--o{ KPI : "muestra"
          COMUNIDAD ||--o{ REPORTE_PROGRAMADO : "programa"
          REPORTE_PROGRAMADO ||--o{ EXPORTACION : "genera"`,
	},
];

export default function Home() {
	const router = useRouter();
	const {
		login: authLogin,
		complete2FALogin,
		isAuthenticated,
		isLoading: authLoading,
	} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	// Estados para 2FA
	const [requires2FA, setRequires2FA] = useState(false);
	const [tempToken, setTempToken] = useState('');
	const [twoFactorCode, setTwoFactorCode] = useState('');
	const [username, setUsername] = useState('');

	// Estado para validación de identificador
	const [identifierValue, setIdentifierValue] = useState('');
	const [identifierValidation, setIdentifierValidation] = useState<{
		isValid: boolean;
		type: string;
		message?: string | undefined;
	} | null>(null);

	// Estado para diagramas
	const [showModal, setShowModal] = useState(false);
	const [selectedDiagram, setSelectedDiagram] = useState<{ title: string; code: string } | null>(null);

	// Redirigir si ya está autenticado
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log(
			'🏠 Estado auth en login page - autenticado:',
			isAuthenticated,
			'cargando:',
			authLoading,
		);
		if (isAuthenticated && !authLoading) {
			// eslint-disable-next-line no-console
			console.log('✅ Usuario autenticado, redirigiendo al dashboard...');
			router.push('/dashboard');
		}
	}, [isAuthenticated, authLoading, router]);

	// Validar identificador en tiempo real
	useEffect(() => {
		if (identifierValue.trim()) {
			const validation = validateIdentifier(identifierValue);
			setIdentifierValidation(validation);
		} else {
			setIdentifierValidation(null);
		}
	}, [identifierValue]);

	useEffect(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: 'base',
			themeVariables: {
				primaryColor: '#004AAD',
				primaryTextColor: '#0A2540',
				primaryBorderColor: '#3673D8',
				lineColor: '#004AAD',
				secondaryColor: '#3673D8',
				tertiaryColor: '#60a5fa',
			},
			securityLevel: 'loose',
		});
	}, []);

	useEffect(() => {
		if (showModal && selectedDiagram) {
			// Pequeño delay para asegurar que el modal esté renderizado
			setTimeout(() => {
				mermaid.run({
					querySelector: '.mermaid',
				});
			}, 100);
		}
	}, [showModal, selectedDiagram]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');

		const formData = new FormData(e.currentTarget);
		const password = formData.get('password') as string;

		// Validación básica
		if (!identifierValue || !password) {
			setError('Por favor completa todos los campos');
			return;
		}

		// Validar formato del identificador
		if (identifierValidation && !identifierValidation.isValid) {
			setError(
				identifierValidation.message || 'Formato de identificador inválido',
			);
			return;
		}

		setIsLoading(true);
		setUsername(identifierValue); // Guardar identifier para 2FA

		try {
			// Formatear el identificador antes de enviarlo
			const formattedIdentifier = formatIdentifier(identifierValue);

			// Usar el login del contexto de autenticación
			const response = await authLogin(formattedIdentifier, password);

			// Verificar si se requiere 2FA
			if (response.twoFactorRequired && response.tempToken) {
				setRequires2FA(true);
				setTempToken(response.tempToken);
				setIsLoading(false);
				return;
			}

			// Si no requiere 2FA, la redirección se maneja en el useEffect cuando isAuthenticated cambie
		} catch (err: any) {
			setError(err.message || 'Error al iniciar sesión');
		} finally {
			setIsLoading(false);
		}
	};

	// Manejar envío de código 2FA
	const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');

		if (!twoFactorCode || twoFactorCode.length !== 6) {
			setError('Por favor ingresa un código de 6 dígitos');
			return;
		}

		if (!tempToken) {
			setError('Token temporal expirado. Por favor inicia sesión nuevamente.');
			setRequires2FA(false);
			return;
		}

		setIsLoading(true);

		try {
			// eslint-disable-next-line no-console
			console.log('📱 Enviando código 2FA...');
			await complete2FALogin(tempToken, twoFactorCode);
			// eslint-disable-next-line no-console
			console.log('✅ Código 2FA verificado, esperando redirección...');
			// La redirección se maneja en el useEffect cuando isAuthenticated cambie
		} catch (err: any) {
			// eslint-disable-next-line no-console
			console.error('❌ Error en 2FA:', err);
			setError(err.message || 'Código de verificación inválido');
		} finally {
			setIsLoading(false);
		}
	};

	// Cancelar 2FA y volver al login normal
	const cancel2FA = () => {
		setRequires2FA(false);
		setTempToken('');
		setTwoFactorCode('');
		setUsername('');
		setError('');
	};

	// Pre-llenar los campos con las credenciales por defecto
	const fillDefaultCredentials = () => {
		const usernameInput = document.querySelector(
			'input[name="username"]',
		) as HTMLInputElement;
		const passwordInput = document.querySelector(
			'input[name="password"]',
		) as HTMLInputElement;

		if (usernameInput) {
			usernameInput.value = 'patrick';
		}
		if (passwordInput) {
			passwordInput.value = 'patrick';
		}
	};

	const handleShowDiagram = (diagram: { title: string; code: string }) => {
		setSelectedDiagram(diagram);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedDiagram(null);
	};

	return (
		<>
			<Head>
				<title>Entrar — Cuentas Claras</title>
			</Head>

			<div
				style={{
					background:
						'linear-gradient(180deg, var(--color-primary) 0%, #07244a 100%)',
					minHeight: '100vh',
					color: 'var(--bs-body-color)',
				}}
			>
				<div className='container'>
					<div className='row align-items-center' style={{ minHeight: '80vh' }}>
						{/* Hero Left Section */}
						<div className='col-lg-6 d-none d-lg-flex hero-left flex-column justify-content-center'>
							{/* Illustrative SVG (buildings) */}
							<div className='mb-4'>
								{/* <svg
                  width='160'
                  height='96'
                  viewBox='0 0 160 96'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-hidden='true'
                >
                  <rect
                    x='2'
                    y='28'
                    width='38'
                    height='66'
                    rx='3'
                    fill='rgba(255,255,255,0.06)'
                  />
                  <rect
                    x='44'
                    y='8'
                    width='28'
                    height='86'
                    rx='3'
                    fill='rgba(255,255,255,0.08)'
                  />
                  <rect
                    x='76'
                    y='36'
                    width='22'
                    height='58'
                    rx='3'
                    fill='rgba(255,255,255,0.05)'
                  />
                  <rect
                    x='102'
                    y='16'
                    width='36'
                    height='78'
                    rx='3'
                    fill='rgba(255,255,255,0.07)'
                  />
                  <rect
                    x='142'
                    y='44'
                    width='14'
                    height='50'
                    rx='3'
                    fill='rgba(255,255,255,0.045)'
                  />
                </svg> */}
							</div>
							<h1 className='mb-3'>Bienvenido a Cuentas Claras</h1>
							<p className='lead'>
								Cuentas Claras es una plataforma integral diseñada para optimizar
								la administración de comunidades y condominios mediante herramientas
								profesionales, análisis avanzado y procesos automatizados.
							</p>

							<ul className='list-unstyled mt-4 feature-list'>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										dashboard
									</span>
									Panel ejecutivo con indicadores en tiempo real, facilitando
									decisiones rápidas y basadas en datos.
								</li>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										business
									</span>
									Gestión centralizada de comunidades y edificios, con soporte para
									múltiples configuraciones.
								</li>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										apartment
									</span>
									Control detallado de unidades, propietarios, arrendatarios y
									ocupación.
								</li>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										payments
									</span>
									Sistema financiero robusto, con pagos online, conciliación
									automática y trazabilidad completa.
								</li>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										receipt_long
									</span>
									Generación automática de documentos contables y administrativos.
								</li>

								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										bar_chart
									</span>
									Reportes avanzados para análisis financiero, operativo y de
									cumplimiento.
								</li>
								<li className='mb-2'>
									<span
										className='material-icons align-middle me-2'
										style={{ color: 'var(--color-accent)' }}
									>
										support_agent
									</span>
									Plataforma de soporte y atención mediante tickets.
								</li>
							</ul>
						</div>

						{/* Login Form Section */}
						<div className='col-lg-6'>
							<div className='login-wrap'>
								<div
									className='login-card card p-4 shadow-lg w-100 align-self-center'
									style={{ maxWidth: '520px' }}
								>
									<div className='d-flex align-items-center mb-3'>
										<div className='me-3 login-illustration'>
											<span
												className='material-icons'
												style={{
													fontSize: '48px',
													color: 'var(--color-accent)',
												}}
											>
												lock
											</span>
										</div>
										<div>
											<div className='brand-lg h4 mb-0'>Cuentas Claras</div>
											<small className='muted'>Gestión condominial</small>
										</div>
									</div>

									{/* Título dinámico */}
									<p className='text-muted'>
										{requires2FA
											? 'Introduce el código de 6 dígitos de tu aplicación de autenticación.'
											: 'Ingresa con tu correo, RUT, DNI o usuario para acceder al panel.'}
									</p>

									{error && (
										<div
											className='alert alert-danger alert-dismissible fade show'
											role='alert'
										>
											<i
												className='material-icons me-2'
												style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}
											>
												error
											</i>
											{error}
											<button
												type='button'
												className='btn-close'
												onClick={() => setError('')}
												aria-label='Close'
											></button>
										</div>
									)}

									{/* Formulario normal de login */}
									{!requires2FA && (
										<form onSubmit={handleSubmit}>
											<div className='mb-3'>
												<label className='form-label'>
													Correo, RUT, DNI o Usuario
												</label>
												<input
													name='identifier'
													type='text'
													className={`form-control ${
														identifierValidation
															? identifierValidation.isValid
																? 'is-valid'
																: 'is-invalid'
															: ''
													}`}
													placeholder='ejemplo@correo.com, 12345678-9, 12345678 o usuario'
													value={identifierValue}
													onChange={e => setIdentifierValue(e.target.value)}
													required
												/>
												{identifierValidation && (
													<div
														className={`${
															identifierValidation.isValid
																? 'valid-feedback'
																: 'invalid-feedback'
														}`}
													>
														{identifierValidation.isValid
															? `Tipo detectado: ${
																	identifierValidation.type === 'email'
																		? 'Correo electrónico'
																		: identifierValidation.type === 'rut'
																			? 'RUT chileno'
																			: identifierValidation.type === 'dni'
																				? 'DNI'
																				: 'Nombre de usuario'
																}`
															: identifierValidation.message ||
																'Formato inválido'}
													</div>
												)}
												{!identifierValidation && (
													<div className='form-text'>
														Puedes usar tu correo electrónico, RUT (Chile), DNI
														o nombre de usuario
													</div>
												)}
											</div>
											<div className='mb-3'>
												<label className='form-label'>Contraseña</label>
												<input
													name='password'
													type='password'
													className='form-control'
													placeholder='********'
													required
												/>
											</div>

											<div className='d-flex justify-content-between align-items-center mb-3'>
												<div className='form-check'>
													<input
														className='form-check-input'
														type='checkbox'
														id='remember'
													/>
													<label
														className='form-check-label'
														htmlFor='remember'
													>
														Recordarme
													</label>
												</div>
												<Link
													href='/forgot-password'
													className='small text-decoration-none'
												>
													¿Olvidaste tu contraseña?
												</Link>
											</div>

											<div className='d-grid'>
												<button
													className='btn btn-primary'
													type='submit'
													disabled={isLoading}
												>
													{isLoading ? 'Entrando...' : 'Entrar'}
												</button>
											</div>
										</form>
									)}

									{/* Formulario de verificación 2FA */}
									{requires2FA && (
										<form onSubmit={handle2FASubmit}>
											<div className='text-center mb-4'>
												<div
													className='d-inline-flex align-items-center justify-content-center bg-light rounded-circle'
													style={{ width: '80px', height: '80px' }}
												>
													<span
														className='material-icons'
														style={{
															fontSize: '40px',
															color: 'var(--color-primary)',
														}}
													>
														verified_user
													</span>
												</div>
												<h5 className='mt-3 mb-1'>
													Verificación de Dos Factores
												</h5>
												<p className='text-muted small mb-0'>
													Usuario: <strong>{username}</strong>
												</p>
											</div>

											<div className='mb-4'>
												<label className='form-label text-center d-block'>
													Código de Verificación
												</label>
												<input
													type='text'
													className='form-control text-center'
													style={{
														fontSize: '1.5rem',
														letterSpacing: '0.5rem',
														height: '60px',
													}}
													placeholder='000000'
													value={twoFactorCode}
													onChange={e =>
														setTwoFactorCode(
															e.target.value.replace(/\D/g, '').slice(0, 6),
														)
													}
													maxLength={6}
													required
													autoFocus
												/>
												<div className='form-text text-center'>
													Ingresa el código de 6 dígitos de tu aplicación de
													autenticación
												</div>
											</div>

											<div className='d-grid gap-2'>
												<button
													className='btn btn-primary'
													type='submit'
													disabled={isLoading || twoFactorCode.length !== 6}
												>
													{isLoading ? (
														<>
															<span
																className='spinner-border spinner-border-sm me-2'
																role='status'
															></span>
															Verificando...
														</>
													) : (
														'Verificar Código'
													)}
												</button>
												<button
													type='button'
													className='btn btn-outline-secondary'
													onClick={cancel2FA}
													disabled={isLoading}
												>
													<span
														className='material-icons me-2'
														style={{ fontSize: '18px' }}
													>
														arrow_back
													</span>
													Volver al Login
												</button>
											</div>
										</form>
									)}

									{/* Credenciales de desarrollo - solo mostrar en login normal */}
									{!requires2FA && (
										<div className='text-center mt-3 small text-muted'>
											Credenciales de desarrollo:{' '}
											<button
												type='button'
												className='btn btn-link btn-sm p-0 text-decoration-none'
												onClick={fillDefaultCredentials}
												style={{ fontSize: 'inherit' }}
											>
												<strong>pat.quintanilla@duocuc.cl</strong> / <strong>123456</strong>
											</button>
											<br />
											<small className='text-muted'>
												Haz click para completar automáticamente
											</small>
										</div>
									)}

									{/* Información adicional para 2FA */}
									{requires2FA && (
										<div className='text-center mt-3'>
											<div className='alert alert-info border-0 bg-light'>
												<div className='d-flex align-items-start'>
													<span
														className='material-icons me-2 text-primary'
														style={{ fontSize: '20px' }}
													>
														info
													</span>
													<div className='text-start small'>
														<strong>
															¿No tienes acceso a tu aplicación de
															autenticación?
														</strong>
														<br />
														Contacta al administrador del sistema para
														desactivar temporalmente 2FA en tu cuenta.
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Secciones con fondo claro */}
			<div style={{ backgroundColor: '#f8f9fa', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
				{/* Floating Particles */}
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='particle'></div>
				<div className='container'>
					{/* Problem & Solution Section */}
					<div className='row mb-5 pb-5 border-bottom'>
						<div className='col-12 text-center mb-5 fade-in'>
							<h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Descripción del Proyecto</h2>
							<p className='lead text-muted'>
								Identificamos los desafíos actuales y creamos una solución integral
							</p>
						</div>
						<div className='col-md-6 mb-4 fade-in'>
							<div className='dark-box'>
								<strong style={{ fontSize: '22px', display: 'block', marginBottom: '15px' }}>⚠️ El Problema</strong>
								<ul>
									<li>Gestión manual de cobros y conciliaciones propensa a errores humanos.</li>
									<li>Falta de trazabilidad y herramientas desconectadas (Excel, Email, Whatsapp).</li>
									<li>Desconfianza de los residentes.</li>
								</ul>
								<div className='text-center mt-4'>
									<i className='material-icons' style={{ fontSize: '80px', color: '#ff6b6b' }}>warning</i>
								</div>
							</div>
						</div>
						<div className='col-md-6 mb-4 fade-in'>
							<div className='dark-box primary'>
								<strong style={{ fontSize: '22px', display: 'block', marginBottom: '15px' }}>✅ Nuestra Solución</strong>
								<ul>
									<li>Plataforma web centralizada y 100% en la nube.</li>
									<li>Automatización del registro de cargos, pagos y conciliaciones bancarias.</li>
									<li>Autenticación segura (JWT, 2FA) y entorno reproducible con Docker.</li>
								</ul>
								<div className='text-center mt-4'>
									<i className='material-icons' style={{ fontSize: '80px', color: '#fff' }}>check_circle</i>
								</div>
							</div>
						</div>
					</div>

					{/* Features Section */}
					<div className='row mb-5'>
						<div className='col-12 text-center mb-5 fade-in'>
							<h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Módulos Principales</h2>
							<p className='lead text-muted'>
								Soluciones diseñadas para una administración eficiente y profesional
							</p>
						</div>
					</div>

					<div className='row g-4 mb-5 pb-5 border-bottom'>
						<div className='col-lg-3 col-md-6 fade-in'>
							<div className='stats-card h-100 text-center'>
								<div className='stats-icon bg-primary mb-4'>
									<i className='material-icons'>business</i>
								</div>
								<h5 className='fw-bold mb-3'>Comunidades</h5>
								<p className='text-muted small'>
									Configuración global, alícuotas, centros de costo y parámetros personalizados por comunidad.
								</p>
							</div>
						</div>

						<div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.1s' }}>
							<div className='stats-card h-100 text-center'>
								<div className='stats-icon bg-success mb-4'>
									<i className='material-icons'>payments</i>
								</div>
								<h5 className='fw-bold mb-3'>Gestión Financiera</h5>
								<p className='text-muted small'>
									Control de gastos, proveedores, documentos de compra y generación automática de asientos.
								</p>
							</div>
						</div>

						<div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.2s' }}>
							<div className='stats-card h-100 text-center'>
								<div className='stats-icon bg-info mb-4'>
									<i className='material-icons'>receipt_long</i>
								</div>
								<h5 className='fw-bold mb-3'>Cobros y Pagos</h5>
								<p className='text-muted small'>
									Emisión masiva de gastos comunes, registro de pagos y conciliación bancaria inteligente.
								</p>
							</div>
						</div>

						<div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.3s' }}>
							<div className='stats-card h-100 text-center'>
								<div className='stats-icon bg-warning mb-4'>
									<i className='material-icons'>security</i>
								</div>
								<h5 className='fw-bold mb-3'>Seguridad</h5>
								<p className='text-muted small'>
									Roles y permisos granulares (RBAC), autenticación 2FA y aislamiento de datos (Multitenancy).
								</p>
							</div>
						</div>
					</div>

					{/* Technologies Section */}
					<div className='row mb-5 pb-5 border-bottom'>
						<div className='col-12 text-center mb-5 fade-in'>
							<h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Tecnologías Utilizadas</h2>
							<p className='lead text-muted'>Stack tecnológico moderno y robusto</p>
						</div>

						<div className='col-lg-4 mb-4 fade-in'>
							<div className='tech-card'>
								<div className='text-center mb-3'>
									<span style={{ fontSize: '50px' }}>🌐</span>
									<h3 className='h4 mt-2'>Frontend</h3>
								</div>
								<ul className='list-unstyled'>
									<li className='mb-2'><strong>Framework:</strong> Next.js</li>
									<li className='mb-2'><strong>Lenguaje:</strong> TypeScript</li>
									<li className='mb-2'><strong>UI:</strong> React, Bootstrap</li>
									<li><strong>Estado:</strong> Hooks, Context</li>
								</ul>
							</div>
						</div>

						<div className='col-lg-4 mb-4 fade-in' style={{ animationDelay: '0.1s' }}>
							<div className='tech-card'>
								<div className='text-center mb-3'>
									<span style={{ fontSize: '50px' }}>🔧</span>
									<h3 className='h4 mt-2'>Backend</h3>
								</div>
								<ul className='list-unstyled'>
									<li className='mb-2'><strong>Runtime:</strong> Node.js</li>
									<li className='mb-2'><strong>Framework:</strong> Express.js</li>
									<li className='mb-2'><strong>DB:</strong> MySQL, Sequelize</li>
									<li><strong>Seguridad:</strong> JWT, 2FA</li>
								</ul>
							</div>
						</div>

						<div className='col-lg-4 mb-4 fade-in' style={{ animationDelay: '0.2s' }}>
							<div className='tech-card'>
								<div className='text-center mb-3'>
									<span style={{ fontSize: '50px' }}>🐳</span>
									<h3 className='h4 mt-2'>Infraestructura</h3>
								</div>
								<ul className='list-unstyled'>
									<li className='mb-2'><strong>Container:</strong> Docker</li>
									<li className='mb-2'><strong>Orquestación:</strong> Docker Compose</li>
									<li className='mb-2'><strong>Proxy:</strong> Nginx</li>
									<li><strong>Cloud:</strong> DigitalOcean</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Diagrams Section */}
					<div className='row mb-5 pb-5 border-bottom'>
						<div className='col-12 text-center mb-5 fade-in'>
							<h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Diagramas del Sistema</h2>
							<p className='lead text-muted'>Arquitectura y diseño detallado</p>
						</div>

						<div className='row g-4'>
							{diagrams.map((diagram, index) => (
								<div key={index} className='col-lg-4 col-md-6 fade-in' style={{ animationDelay: `${index * 0.1}s` }}>
									<div
										className='card h-100 shadow-sm hover-card'
										style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
										onClick={() => handleShowDiagram(diagram)}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleShowDiagram(diagram); } }}
									>
										<div className='card-body d-flex flex-column align-items-center justify-content-center p-4'>
											<div className='mb-3 text-primary'>
												<i className='material-icons' style={{ fontSize: '48px' }}>schema</i>
											</div>
											<h5 className='card-title text-center fw-bold mb-0'>{diagram.title}</h5>
											<p className='text-muted small mt-2 mb-0'>Click para ver detalle</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Team Section */}
					<div className='row mb-5'>
						<div className='col-12 text-center mb-5 fade-in'>
							<h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Equipo de Desarrollo</h2>
							<p className='lead text-muted'>Integrantes del proyecto de título</p>
						</div>

						<div className='col-lg-4 mb-4 fade-in'>
							<div className='team-card'>
								<Image src="https://ui-avatars.com/api/?name=Patricio+Quintanilla&background=004AAD&color=fff&size=128" className="avatar" alt="Patricio" width={128} height={128} unoptimized />
								<h3 className='h4'>Patricio Quintanilla</h3>
								<p className='text-primary fw-bold'>Frontend Developer</p>
								<p className='small text-muted'>
									Responsable del desarrollo de la interfaz, experiencia del usuario y optimización general del frontend.
								</p>
							</div>
						</div>

						<div className='col-lg-4 mb-4 fade-in' style={{ animationDelay: '0.1s' }}>
							<div className='team-card'>
								<Image src="https://ui-avatars.com/api/?name=Frank+Vogt&background=004AAD&color=fff&size=128" className="avatar" alt="Frank" width={128} height={128} unoptimized />
								<h3 className='h4'>Frank Vogt</h3>
								<p className='text-primary fw-bold'>Backend Developer</p>
								<p className='small text-muted'>
									Encargado de la arquitectura del sistema, APIs, seguridad, autenticación y lógica de negocio.
								</p>
							</div>
						</div>

						<div className='col-lg-4 mb-4 fade-in' style={{ animationDelay: '0.2s' }}>
							<div className='team-card'>
								<Image src="https://ui-avatars.com/api/?name=Mat%C3%ADas+Rom%C3%A1n&background=004AAD&color=fff&size=128" className="avatar" alt="Matías" width={128} height={128} unoptimized />
								<h3 className='h4'>Matías Román</h3>
								<p className='text-primary fw-bold'>Documentación y QA</p>
								<p className='small text-muted'>
									Responsable de la documentación formal, manuales, diagramación y control de calidad (QA).
								</p>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className='row mt-5 pt-5 border-top border-secondary border-opacity-25'>
						<div className='col-12 text-center'>
							<div className='mb-4'>
								<h3 className='fw-bold text-dark mb-3'>¿Listo para modernizar la administración de tu comunidad?</h3>
								<p className='text-muted mb-4'>
									Más de 500 condominios y comunidades ya confían en Cuentas Claras para una gestión eficiente, segura y transparente.
								</p>
								<button className='btn btn-primary btn-lg px-4 py-2' style={{ borderRadius: '25px' }}>
									<span className='material-icons me-2' style={{ fontSize: '20px' }}>login</span>
									Comenzar Ahora
								</button>
							</div>

							<div className='mt-5 pt-4 border-top border-secondary border-opacity-25'>
								<p className='text-muted mb-3'>
									© 2025 Cuentas Claras. Todos los derechos reservados.
								</p>
								<div className='d-flex justify-content-center gap-4'>
									<button className='btn btn-link text-muted text-decoration-none small p-0'>
										Términos de Servicio
									</button>
									<button className='btn btn-link text-muted text-decoration-none small p-0'>
										Política de Privacidad
									</button>
									<button className='btn btn-link text-muted text-decoration-none small p-0'>
										Contacto
									</button>
									<a
										href='https://github.com/BigFrankV/proyecto_cuentas_claras'
										target='_blank'
										rel='noopener noreferrer'
										className='btn btn-link text-muted text-decoration-none small p-0 d-flex align-items-center'
									>
										<span className='material-icons me-1' style={{ fontSize: '16px' }}>code</span>
										Repositorio
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal para diagramas */}
			<Modal
				show={showModal}
				onHide={handleCloseModal}
				size="lg"
				aria-labelledby="modal-diagram-title"
			>
				<Modal.Header closeButton>
					<Modal.Title id="modal-diagram-title">
						{selectedDiagram?.title}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedDiagram && (
						<div className="mermaid">
							{selectedDiagram.code}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Cerrar
					</Button>
				</Modal.Footer>
			</Modal>

			<Script
				src="https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js"
				strategy="afterInteractive"
				onLoad={() => {
					(window as any).mermaid.initialize({
						startOnLoad: false,
						theme: 'base',
						themeVariables: {
							primaryColor: '#004AAD',
							primaryTextColor: '#0A2540',
							primaryBorderColor: '#3673D8',
							lineColor: '#004AAD',
							secondaryColor: '#3673D8',
							tertiaryColor: '#60a5fa',
						},
						securityLevel: 'loose',
					});
				}}
			/>

			{/* Diagram Modal */}
			<Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
				<Modal.Header closeButton>
					<Modal.Title>{selectedDiagram?.title}</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ overflow: 'auto', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					{selectedDiagram && (
						<div className="mermaid" key={selectedDiagram.title}>
							{selectedDiagram.code}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Cerrar
					</Button>
				</Modal.Footer>
			</Modal>

			<style jsx>{`
        .brand-lg {
          color: var(--color-accent);
          font-weight: 700;
          letter-spacing: 0.4px;
        }
        .login-illustration {
          width: 120px;
          height: 120px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-left {
          color: white;
          padding: 48px 32px;
        }
        .hero-left h1 {
          font-size: 28px;
          line-height: 1.05;
        }
        .hero-left p {
          color: rgba(255, 255, 255, 0.85);
        }
        .login-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
        }
        @media (max-width: 767px) {
          .hero-left {
            text-align: center;
            padding: 24px;
          }
          .login-wrap {
            padding: 24px 0;
          }
        }

        /* Modern Section Separators */
        .section-separator {
          position: relative;
          width: 100%;
          height: 120px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .separator-wave {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
          fill: #f8f9fa;
        }

        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          position: relative;
        }

        .divider-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #007bff 50%, transparent 100%);
          position: relative;
        }

        .divider-dot {
          width: 12px;
          height: 12px;
          background: #007bff;
          border-radius: 50%;
          margin: 0 20px;
          box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
        }

        .divider-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 30px;
          color: white;
          font-size: 24px;
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Parallax Background Elements */
        .parallax-bg {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          animation: float-slow 20s ease-in-out infinite;
        }

        .parallax-bg-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: -5%;
          animation-delay: 0s;
        }

        .parallax-bg-2 {
          width: 200px;
          height: 200px;
          top: 60%;
          right: -3%;
          animation-delay: 5s;
        }

        .parallax-bg-3 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        /* Floating Elements */
        .floating-element {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 123, 255, 0.6);
          font-size: 24px;
          animation: float-random 15s ease-in-out infinite;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .floating-element-1 {
          top: 15%;
          right: 10%;
          animation-delay: 0s;
        }

        .floating-element-2 {
          top: 40%;
          left: 8%;
          animation-delay: 3s;
        }

        .floating-element-3 {
          bottom: 30%;
          right: 15%;
          animation-delay: 6s;
        }

        .floating-element-4 {
          bottom: 10%;
          left: 15%;
          animation-delay: 9s;
        }

        @keyframes float-random {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-30px) translateX(20px) rotate(90deg); }
          50% { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
          75% { transform: translateY(-40px) translateX(10px) rotate(270deg); }
        }

        /* Enhanced Landing page animations */
        .fade-in {
          animation: fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateY(50px) scale(0.95);
        }

        .fade-in:nth-child(odd) {
          animation-delay: 0.1s;
        }

        .fade-in:nth-child(even) {
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Staggered animations for cards */
        .stats-card:nth-child(1) { animation-delay: 0.1s; }
        .stats-card:nth-child(2) { animation-delay: 0.2s; }
        .stats-card:nth-child(3) { animation-delay: 0.3s; }
        .stats-card:nth-child(4) { animation-delay: 0.4s; }

        /* Scroll-triggered animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(100px) rotateX(10deg);
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
        }

        /* Enhanced hover effects */
        .stats-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .stats-card:hover {
          transform: translateY(-12px) rotateY(5deg) scale(1.02) !important;
          box-shadow: 0 20px 40px rgba(13, 71, 161, 0.25) !important;
        }

        .stats-card .stats-icon {
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-style: preserve-3d;
        }

        .stats-card:hover .stats-icon {
          transform: scale(1.2) rotateY(15deg) rotateX(10deg);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        /* Morphing animations */
        .morph-card {
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          border-radius: 15px;
        }

        .morph-card:hover {
          border-radius: 25px;
          transform: perspective(1000px) rotateY(5deg) rotateX(5deg);
        }

        /* Gradient text animations */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Particle effects */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(0,123,255,0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: particle-float 8s linear infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 4s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 6s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 7s; }

        @keyframes particle-float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        /* Enhanced card hover with glow */
        .card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .card:hover::before {
          left: 100%;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }

        /* Advanced Integration Card Effects */
        .integration-card {
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .integration-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .integration-card:hover::after {
          transform: translateX(100%);
        }

        .integration-card:hover {
          transform: translateY(-15px) scale(1.03) rotateY(2deg) !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25) !important;
          filter: brightness(1.05);
        }

        .integration-card .integration-icon {
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          background: rgba(255, 255, 255, 0.25);
          border-radius: 15px;
          padding: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .integration-card:hover .integration-icon {
          transform: scale(1.15) rotate(10deg);
          background: rgba(255, 255, 255, 0.35);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .integration-card .integration-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .integration-card:hover .integration-overlay {
          opacity: 1;
        }

        .integration-features .badge {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(5px);
        }

        .integration-card:hover .badge {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 15px rgba(0,0,0,0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* Enhanced floating animation with more variation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          50% { transform: translateY(-16px) rotate(-1deg); }
          75% { transform: translateY(-8px) rotate(1deg); }
        }

        .integration-card:nth-child(1) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 0s;
        }
        .integration-card:nth-child(2) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .integration-card:nth-child(3) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .integration-card:nth-child(4) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 3s;
        }

        /* New Styles from Presentation */
        .team-card {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 25px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 20px 40px -10px rgba(0, 74, 173, 0.15);
          transition: transform 0.3s;
          height: 100%;
        }
        .team-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-accent);
        }
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin-bottom: 15px;
          border: 3px solid #e0f2fe;
        }
        .dark-box {
          background: #1e293b;
          color: white;
          padding: 30px;
          border-radius: 12px;
          height: 100%;
          box-shadow: 0 20px 40px -10px rgba(0, 74, 173, 0.15);
        }
        .dark-box.primary {
          background: var(--color-primary);
        }
        .dark-box ul {
          padding-left: 20px;
          margin-top: 15px;
        }
        .dark-box li {
          margin-bottom: 12px;
          font-size: 1.1rem;
        }
        .tech-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          height: 100%;
          transition: transform 0.3s;
        }
        .tech-card:hover {
          transform: translateY(-5px);
        }
        .section-title {
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-primary);
        }
      `}</style>
		</>
	);
}
