import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

export default function TandaSelector({ empleadoId, tandaId, setTandaId }) {
  const [tandas, setTandas] = useState([]);

  useEffect(() => {
    axios.get(`/api/tandas?empleadoId=${empleadoId}`)
      .then(res => setTandas(res.data))
      .catch(() => setTandas([]));
  }, [empleadoId]);

  return (
    <FormControl fullWidth sx={{ my: 2 }}>
      <InputLabel>Tanda</InputLabel>
      <Select value={tandaId || ''} label="Tanda" onChange={e => setTandaId(e.target.value)}>
        {tandas.map(t => (
          <MenuItem key={t._id} value={t._id}>{t.nombre}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
