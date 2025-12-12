const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {

    await prisma.issueType.deleteMany()
    await prisma.category.deleteMany()

    await prisma.category.create({
        data: {
            name: 'Espaços Públicos',
            issueTypes: {
                create: [
                    { title: 'Praça/Jardim sem Manutenção'},
                    { title: 'Parquinho infantil quebrado'},
                    { title: 'Banco ou estrutura danificada em espaço público'},
                    { title: 'Árvores caídas / risco de queda'},
                    { title: 'Árvores obstruindo calçadas ou fiação'},
                ]
            }
        }
    })

    await prisma.category.create({
        data: {
            name: 'Infraestrutura Urbana',
            issueTypes: {
                create: [
                    { title: 'Buracos na Rua / Pavimentação Danificada'},
                    { title: 'Calçada Quebrada / Irregular'},
                    { title: 'Sinaleira Quebrada / Semáforo Apagado'},
                    { title: 'Iluminação Pública Apagada ou Piscando'},
                    { title: 'Placas de trânsito Danificadas ou Faltando'},
                ]
            }
        }
    })

    await prisma.category.create({
        data: {
            name: 'Mobilidade e Transporte',
            issueTypes: {
                create: [
                    { title: 'Ponto de Ônibus sem Cobertura ou Danificado'},
                    { title: 'Faixa de Pedestre Apagada'},
                    { title: 'Ciclovia Danificada ou Obstruída'},
                    { title: 'Carros Estacionados Irregularmente'},
                ]
            }
        }
    })

    await prisma.category.create({
        data: {
            name: 'Saneamento e Meio Ambiente',
            issueTypes: {
                create: [
                    { title: 'Vazamento de Água'},
                    { title: 'Esgoto a Céu Aberto'},
                    { title: 'Alagamentos em Dias de Chuva'},
                    { title: 'Descarte Irregular de Lixo'},
                    { title: 'Lixo acumulado em Locais Públicos'},
                    { title: 'Entulho Abandonado'},
                    { title: 'Poluição Sonora'},
                    { title: 'Queimadura Urbana / Fumaça'},
                ]
            }
        }
    })

    await prisma.category.create({
        data: {
            name: 'Segurança e Cidadania',
            issueTypes: {
                create: [
                    { title: 'Postes Inclinados / Risco de Queda'},
                    { title: 'Locais com Iluminação Insuficiente'},
                    { title: 'Acúmulo de Veículos Abandonados'},
                    { title: 'Denúncia de Vandalismo em Espaço Público'},
                ]
            }
        }
    })
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
}).finally(async () => {
    await prisma.$disconnect()
})