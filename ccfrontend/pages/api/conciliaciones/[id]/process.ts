import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      // Simular procesamiento de archivo
      const mockProcessingResult = {
        conciliationId: Number(id),
        processedAt: new Date().toISOString(),
        totalTransactions: 25,
        matchedTransactions: 20,
        unMatchedTransactions: 5,
        manualTransactions: 0,
        transactions: [
          {
            id: 1,
            date: '2024-03-15',
            description: 'Pago Gastos Comunes - Torre A',
            reference: 'REF001',
            amount: 150000,
            type: 'credit',
            matched: true,
            matchStatus: 'matched'
          },
          {
            id: 2,
            date: '2024-03-16',
            description: 'Transferencia Mantenimiento',
            reference: 'REF002',
            amount: -75000,
            type: 'debit',
            matched: true,
            matchStatus: 'matched'
          },
          {
            id: 3,
            date: '2024-03-17',
            description: 'Pago Servicios Básicos',
            reference: 'REF003',
            amount: -25000,
            type: 'debit',
            matched: false,
            matchStatus: 'unmatched'
          },
          {
            id: 4,
            date: '2024-03-18',
            description: 'Ingreso Multas',
            reference: 'REF004',
            amount: 50000,
            type: 'credit',
            matched: true,
            matchStatus: 'matched'
          },
          {
            id: 5,
            date: '2024-03-19',
            description: 'Gasto Mantenimiento Ascensor',
            reference: 'REF005',
            amount: -120000,
            type: 'debit',
            matched: false,
            matchStatus: 'unmatched'
          }
        ]
      };

      // Simular delay de procesamiento
      setTimeout(() => {
        res.status(200).json({
          message: 'Archivo procesado exitosamente',
          data: mockProcessingResult
        });
      }, 2000);

    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({
        error: 'Error al procesar el archivo'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      error: `Método ${req.method} no permitido`
    });
  }
}