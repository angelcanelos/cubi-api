import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [entradasTroceria, entradasProduccion] = await Promise.all([
      this.prisma.entradaTroceria.findMany({
        where: { fecha: { gte: today, lt: tomorrow } },
        select: { volumenTotal: true, totalTrozas: true }
      }),
      this.prisma.entradaProduccion.findMany({
        where: { fecha: { gte: today, lt: tomorrow } },
        select: { volumenTotal: true }
      })
    ]);

    const volumenIngresadoHoy = entradasTroceria.reduce((sum, e) => sum + e.volumenTotal, 0);
    const totalTrozasHoy = entradasTroceria.reduce((sum, e) => sum + e.totalTrozas, 0);
    const volumenProducidoHoy = entradasProduccion.reduce((sum, e) => sum + e.volumenTotal, 0);
    
    // Rendimiento general sobre el histórico para evitar ceros si hoy no hay produccion
    const { _sum: sumTroceria } = await this.prisma.entradaTroceria.aggregate({ _sum: { volumenTotal: true } });
    const { _sum: sumProduccion } = await this.prisma.entradaProduccion.aggregate({ _sum: { volumenTotal: true } });
    
    const totalHistoricoIngreso = sumTroceria.volumenTotal || 0;
    const totalHistoricoProduccion = sumProduccion.volumenTotal || 0;
    
    let rendimientoGeneral = 0;
    if (totalHistoricoIngreso > 0) {
      rendimientoGeneral = (totalHistoricoProduccion / totalHistoricoIngreso) * 100;
    }

    return {
      volumenIngresadoHoy,
      volumenProducidoHoy,
      totalTrozasHoy,
      rendimientoGeneral: Number(rendimientoGeneral.toFixed(2)),
      totalHistoricoIngreso,
      totalHistoricoProduccion
    };
  }

  async getDailyChart() {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);
    daysAgo.setHours(0, 0, 0, 0);

    const [troceria, produccion] = await Promise.all([
        this.prisma.entradaTroceria.findMany({
            where: { fecha: { gte: daysAgo } },
            select: { fecha: true, volumenTotal: true }
        }),
        this.prisma.entradaProduccion.findMany({
            where: { fecha: { gte: daysAgo } },
            select: { fecha: true, volumenTotal: true }
        })
    ]);

    const chartMap = new Map<string, { date: string, ingreso: number, produccion: number }>();
    
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartMap.set(dateStr, { date: dateStr, ingreso: 0, produccion: 0 });
    }

    troceria.forEach(t => {
        const dateStr = t.fecha.toISOString().split('T')[0];
        if (chartMap.has(dateStr)) {
            chartMap.get(dateStr)!.ingreso += t.volumenTotal;
        }
    });

    produccion.forEach(p => {
        const dateStr = p.fecha.toISOString().split('T')[0];
        if (chartMap.has(dateStr)) {
            chartMap.get(dateStr)!.produccion += p.volumenTotal;
        }
    });

    return Array.from(chartMap.values());
  }

  async getRecentEntries() {
    return this.prisma.entradaTroceria.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        fecha: true,
        totalTrozas: true,
        volumenTotal: true
      }
    });
  }
}
