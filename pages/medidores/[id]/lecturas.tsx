
import React, { useState, useMemo, ChangeEvent, FormEvent } from "react";
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Card, Button, Form, InputGroup, Badge, Row, Col, Modal, Alert } from "react-bootstrap";
import { PhotoCamera, Edit, Photo, Save, Clear, Assessment, FileDownload, PlaylistAddCheck, ArrowBack } from "@mui/icons-material";

// Tipos de datos
interface Meter {
  id: string;
  unidad: string;
  torre: string;
  tipo: "electric" | "water" | "gas";
  icon: React.ReactNode;
  ultimaLectura: number;
  unidadMedida: string;
  estado: "vencida" | "aldia" | "mantenimiento";
  estadoTexto: string;
  estadoColor: string;
}

interface Reading {
  id: string;
  fecha: string; // ISO
  valor: number;
  consumo: number;
  tipo: "real" | "estimada" | "cliente";
  observaciones?: string;
  fotoUrl?: string;
  estado: "confirmada" | "pendiente" | "estimada" | "error";
  usuario: string;
}

// Datos de ejemplo (simular fetch)
const METERS: Meter[] = [
  {
    id: "MED-001-2024",
    unidad: "A-101",
    torre: "Norte",
    tipo: "electric",
    icon: <span className="material-icons text-warning">flash_on</span>,
    ultimaLectura: 1245,
    unidadMedida: "kWh",
    estado: "vencida",
    estadoTexto: "Vencida hace 2 días",
    estadoColor: "danger",
  },
  {
    id: "MED-002-2024",
    unidad: "A-101",
    torre: "Norte",
    tipo: "water",
    icon: <span className="material-icons text-primary">water_drop</span>,
    ultimaLectura: 18500,
    unidadMedida: "L",
    estado: "aldia",
    estadoTexto: "Al día",
    estadoColor: "success",
  },
  {
    id: "MED-003-2024",
    unidad: "B-205",
    torre: "Sur",
    tipo: "gas",
    icon: <span className="material-icons text-danger">local_fire_department</span>,
    ultimaLectura: 450,
    unidadMedida: "m³",
    estado: "mantenimiento",
    estadoTexto: "Mantenimiento",
    estadoColor: "warning",
  },
];

const READING_HISTORY: Record<string, Reading[]> = {
  "MED-001-2024": [
    {
      id: "r1",
      fecha: "2024-09-15T14:30",
      valor: 1245,
      consumo: 125,
      tipo: "real",
      estado: "confirmada",
      usuario: "Patricia Contreras",
    },
    {
      id: "r2",
      fecha: "2024-08-15T09:15",
      valor: 1120,
      consumo: 142,
      tipo: "real",
      estado: "confirmada",
      usuario: "Patricia Contreras",
    },
    {
      id: "r3",
      fecha: "2024-07-15T16:45",
      valor: 978,
      consumo: 189,
      tipo: "estimada",
      estado: "estimada",
      usuario: "Sistema",
    },
    {
      id: "r4",
      fecha: "2024-06-15T11:20",
      valor: 789,
      consumo: 168,
      tipo: "real",
      estado: "confirmada",
      usuario: "Patricia Contreras",
    },
  ],
  // ...otros medidores
};

const tipoLecturaOptions = [
  { value: "real", label: "Lectura Real" },
  { value: "estimada", label: "Estimada" },
  { value: "cliente", label: "Reportada por Cliente" },
];

const estadoBadge = {
  confirmada: "success",
  pendiente: "warning",
  estimada: "info",
  error: "danger",
};

export default function LecturasMedidor() {
  const router = useRouter();
  // Estado
  // METERS[0] could be undefined in some strict TS configs, provide a safe fallback
  const [selectedMeter, setSelectedMeter] = useState<Meter>(METERS[0] as Meter);
  const [readingDate, setReadingDate] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [currentReading, setCurrentReading] = useState<string>("");
  const [readingType, setReadingType] = useState<string>("real");
  const [notes, setNotes] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [historyFilter, setHistoryFilter] = useState<string>("todas");
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);

  // Historial filtrado
  const history = useMemo(() => {
    let h = READING_HISTORY[selectedMeter.id] || [];
    if (historyFilter === "año") {
      const year = new Date().getFullYear();
      h = h.filter(r => new Date(r.fecha).getFullYear() === year);
    } else if (historyFilter === "mes") {
      const month = new Date().getMonth();
      h = h.filter(r => new Date(r.fecha).getMonth() === month);
    }
    return h;
  }, [selectedMeter, historyFilter]);

  // Consumo calculado
  const lastReading = history[0]?.valor ?? selectedMeter.ultimaLectura;
  const consumo =
    currentReading && !isNaN(Number(currentReading))
      ? Math.max(Number(currentReading) - lastReading, 0)
      : 0;

  // Handlers
  const handleMeterSelect = (meter: Meter) => {
    setSelectedMeter(meter);
    setCurrentReading("");
    setNotes("");
    setPhoto(null);
    setPhotoPreview("");
    setReadingDate(new Date().toISOString().slice(0, 16));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (Number(currentReading) < lastReading) {
      if (!window.confirm("La lectura actual es menor que la anterior. ¿Está seguro de continuar?")) return;
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setCurrentReading("");
    setNotes("");
    setPhoto(null);
    setPhotoPreview("");
    setReadingDate(new Date().toISOString().slice(0, 16));
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Lecturas del Medidor — Cuentas Claras</title>
      </Head>
      <Layout title='Lecturas del Medidor'>
        <div className="container-fluid py-4">
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h4 mb-0">Lecturas de Medidores</h2>
                  <p className="text-muted mb-0">Registro manual y consulta de lecturas</p>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant={bulkMode ? "secondary" : "outline-primary"}
                    onClick={() => setBulkMode(b => !b)}
                  >
                    <PlaylistAddCheck className="me-1" />
                    {bulkMode ? "Desactivar Modo Masivo" : "Modo Masivo"}
                  </Button>
                  <Button variant="outline-secondary" className="d-none d-lg-inline" onClick={() => router.push('/medidores')}>
                    <ArrowBack className="me-1" /> Volver
                  </Button>
                </div>
              </div>
            </Col>
          </Row>

          {bulkMode && (
            <div className="bulk-reading-mode mb-4">
              <Row className="align-items-center">
                <Col md={8} className="d-flex align-items-center">
                  <span className="material-icons me-2 text-primary">info</span>
                  <div>
                    <div className="fw-bold">Modo de Lectura Masiva Activado</div>
                    <small className="text-muted">Selecciona múltiples medidores para registrar lecturas de forma eficiente</small>
                  </div>
                </Col>
                <Col md={4} className="text-md-end mt-2 mt-md-0">
                  <Button variant="success" disabled>
                    <Save className="me-1" /> Guardar Todas (0)
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          <Row>
            {/* Selector de medidor y formulario */}
            <Col xs={12} lg={5}>
              <Card className="mb-3 meter-selector">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Seleccionar Medidor</h5>
                    <InputGroup style={{ width: "auto" }}>
                      <InputGroup.Text className="bg-light border-0">
                        <span className="material-icons text-muted">search</span>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                  <div>
                    {METERS.filter(m =>
                      m.id.toLowerCase().includes(search.toLowerCase()) ||
                      m.unidad.toLowerCase().includes(search.toLowerCase()) ||
                      m.torre.toLowerCase().includes(search.toLowerCase())
                    ).map(meter => (
                      <div
                        key={meter.id}
                        className={`meter-option mb-2 ${meter.id === selectedMeter.id ? "selected" : ""}`}
                        onClick={() => handleMeterSelect(meter)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold d-flex align-items-center">
                              {meter.icon}
                              {meter.id}
                            </div>
                            <small className="text-muted">Unidad {meter.unidad} - Torre {meter.torre}</small>
                            <div className="mt-1">
                              <small className={`text-${meter.estadoColor}`}>{meter.estadoTexto}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{meter.ultimaLectura.toLocaleString()} {meter.unidadMedida}</div>
                            <small className="text-muted">Última lectura</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card className="reading-form-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Nueva Lectura</h5>
                    {selectedMeter.estado === "vencida" && (
                      <Badge bg="warning" text="dark">Lectura Vencida</Badge>
                    )}
                  </div>
                  <Form onSubmit={handleFormSubmit} autoComplete="off">
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Lectura</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={readingDate}
                        onChange={e => setReadingDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Lectura Actual</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          className="reading-input"
                          placeholder="0"
                          step="0.01"
                          value={currentReading}
                          onChange={e => setCurrentReading(e.target.value)}
                          required
                        />
                        <InputGroup.Text>{selectedMeter.unidadMedida}</InputGroup.Text>
                      </InputGroup>
                      <Form.Text>Última lectura: {lastReading.toLocaleString()} {selectedMeter.unidadMedida}</Form.Text>
                    </Form.Group>
                    <div className="consumption-display mb-3">
                      <div className="consumption-value">{consumo.toLocaleString()} {selectedMeter.unidadMedida}</div>
                      <div className="text-muted">Consumo calculado</div>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Lectura</Form.Label>
                      <Form.Select
                        value={readingType}
                        onChange={e => setReadingType(e.target.value)}
                        required
                      >
                        {tipoLecturaOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Observaciones</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Notas adicionales..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Foto del Medidor</Form.Label>
                      <div
                        className="photo-capture mb-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => document.getElementById("photoInput")?.click()}
                      >
                        <PhotoCamera style={{ fontSize: 32, color: "#6c757d" }} />
                        <div className="fw-bold mt-2">Tomar Foto</div>
                        <small className="text-muted">Opcional - Evidencia de la lectura</small>
                      </div>
                      <Form.Control
                        type="file"
                        id="photoInput"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handlePhotoChange}
                      />
                      {photoPreview && (
                        <div>
                          <img src={photoPreview} alt="Foto del medidor" className="photo-preview mb-2" style={{ maxWidth: "100%", borderRadius: 8 }} />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => { setPhoto(null); setPhotoPreview(""); }}
                          >
                            <span className="material-icons">delete</span> Eliminar foto
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button type="submit" variant="primary">
                        <Save className="me-1" /> Guardar Lectura
                      </Button>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => {
                          setCurrentReading("");
                          setNotes("");
                          setPhoto(null);
                          setPhotoPreview("");
                          setReadingDate(new Date().toISOString().slice(0, 16));
                        }}
                      >
                        <Clear className="me-1" /> Limpiar
                      </Button>
                    </div>
                    {showSuccess && <Alert variant="success" className="mt-3">Lectura guardada exitosamente</Alert>}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            {/* Historial de lecturas */}
            <Col xs={12} lg={7}>
              <Card className="reading-history">
                <Card.Header className="reading-history-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Historial de Lecturas - {selectedMeter.id}</h5>
                    <div className="btn-group btn-group-sm" role="group">
                      <Button
                        variant={historyFilter === "todas" ? "outline-secondary active" : "outline-secondary"}
                        onClick={() => setHistoryFilter("todas")}
                      >
                        Todas
                      </Button>
                      <Button
                        variant={historyFilter === "año" ? "outline-secondary active" : "outline-secondary"}
                        onClick={() => setHistoryFilter("año")}
                      >
                        Este Año
                      </Button>
                      <Button
                        variant={historyFilter === "mes" ? "outline-secondary active" : "outline-secondary"}
                        onClick={() => setHistoryFilter("mes")}
                      >
                        Este Mes
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: 0 }}>
                  {history.length === 0 ? (
                    <div className="p-4 text-center text-muted">No hay lecturas registradas.</div>
                  ) : (
                    history.map(reading => (
                      <div key={reading.id} className="reading-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold">{new Date(reading.fecha).toLocaleString("es-CL")}</div>
                            <div className="text-primary fw-bold">{reading.valor.toLocaleString()} {selectedMeter.unidadMedida}</div>
                            <small className="text-muted">Consumo: {reading.consumo.toLocaleString()} {selectedMeter.unidadMedida}</small>
                          </div>
                          <div className="text-end">
                            <span className={`status-badge status-${estadoBadge[reading.estado] || "secondary"} mb-2`}>
                              {reading.estado.charAt(0).toUpperCase() + reading.estado.slice(1)}
                            </span>
                            <div className="small text-muted">Por: {reading.usuario}</div>
                            <div className="mt-2">
                              <Button variant="outline-primary" size="sm" className="me-1" title="Editar">
                                <Edit fontSize="small" />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                title="Ver Foto"
                                disabled={!reading.fotoUrl}
                                onClick={() => setShowPhotoModal(reading.fotoUrl || "")}
                              >
                                <Photo fontSize="small" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
              {/* Acciones rápidas */}
              <div className="mt-3">
                <Row>
                  <Col xs={6}>
                    <Button variant="outline-primary" className="w-100" onClick={() => alert("Generando reporte de lecturas...")}> <Assessment className="me-1" /> Generar Reporte </Button>
                  </Col>
                  <Col xs={6}>
                    <Button variant="outline-secondary" className="w-100" onClick={() => alert("Exportando datos a Excel...")}> <FileDownload className="me-1" /> Exportar Datos </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          {/* Modal para foto */}
          <Modal show={!!showPhotoModal} onHide={() => setShowPhotoModal(null)} centered>
            <Modal.Body>
              {showPhotoModal && <img src={showPhotoModal} alt="Foto de lectura" style={{ width: "100%" }} />}
            </Modal.Body>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

// Disable static optimization for this page to avoid EMFILE errors with MUI icons
export const config = {
  unstable_runtimeJS: true,
};
