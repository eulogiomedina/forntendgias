import React, { useState } from 'react';
import { Button, TextField, Box, Snackbar } from '@mui/material';
import axios from 'axios';

export default function RegistrarPago({ tandaId, empleadoId }) {
  const [form, setForm] = useState({ usuario: '', monto: '', fecha: '', metodo: '', comprobante: null });
  const [open, setOpen] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setForm({ ...form, comprobante: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!tandaId) return;
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('tandaId', tandaId);
    data.append('empleadoId', empleadoId);

    await axios.post('/api/pagos/registrar', data);
    setOpen(true);
    setForm({ usuario: '', monto: '', fecha: '', metodo: '', comprobante: null });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField name="usuario" label="Usuario" value={form.usuario} onChange={handleChange} fullWidth margin="normal" required />
      <TextField name="monto" label="Monto" type="number" value={form.monto} onChange={handleChange} fullWidth margin="normal" required />
      <TextField name="fecha" label="Fecha" type="date" value={form.fecha} onChange={handleChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
      <TextField name="metodo" label="Método de Pago" value={form.metodo} onChange={handleChange} fullWidth margin="normal" required />
      <input type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ margin: '16px 0' }} />
      <Button type="submit" variant="contained" color="primary">Registrar Pago</Button>
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)} message="Pago registrado exitosamente" />
    </Box>
  );
}
