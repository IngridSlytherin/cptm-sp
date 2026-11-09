import { OperationalStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const lines = [
  { code:'line-1-blue', number:'1', name:'Azul', operator:'Metrô de São Paulo', color:'#005CA9' },
  { code:'line-2-green', number:'2', name:'Verde', operator:'Metrô de São Paulo', color:'#008061' },
  { code:'line-3-red', number:'3', name:'Vermelha', operator:'Metrô de São Paulo', color:'#EE372F' },
  { code:'line-4-yellow', number:'4', name:'Amarela', operator:'ViaQuatro', color:'#FFD400' },
  { code:'line-5-lilac', number:'5', name:'Lilás', operator:'ViaMobilidade', color:'#9B3894' },
  { code:'line-7-ruby', number:'7', name:'Rubi', operator:'CPTM', color:'#CA016B' },
  { code:'line-8-diamond', number:'8', name:'Diamante', operator:'ViaMobilidade', color:'#8F8F8C' },
  { code:'line-9-emerald', number:'9', name:'Esmeralda', operator:'ViaMobilidade', color:'#00A88E' },
  { code:'line-10-turquoise', number:'10', name:'Turquesa', operator:'CPTM', color:'#008B95' },
  { code:'line-11-coral', number:'11', name:'Coral', operator:'CPTM', color:'#F04E23' },
  { code:'line-12-sapphire', number:'12', name:'Safira', operator:'CPTM', color:'#1C146B' },
  { code:'line-13-jade', number:'13', name:'Jade', operator:'CPTM', color:'#00B352' },
  { code:'line-15-silver', number:'15', name:'Prata', operator:'Metrô de São Paulo', color:'#A6A9AA' },
] as const;

async function main(): Promise<void> {
  for (const line of lines) {
    await prisma.railwayLine.upsert({
      where:{code:line.code},
      update:{...line},
      create:{...line,currentStatus:OperationalStatus.UNKNOWN},
    });
  }
}

main().catch((error: unknown)=>{ console.error(error); process.exitCode=1; }).finally(async()=>prisma.$disconnect());
