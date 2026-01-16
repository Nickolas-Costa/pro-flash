# PRO > FLASH ⚡

Ferramenta Técnica e Estratégica para Avaliação Imobiliária

O PRO > FLASH é uma aplicação web progressiva (PWA) desenvolvida para corretores e avaliadores imobiliários. Ela substitui planilhas complexas por uma interface mobile-first, intuitiva e que funciona 100% offline, permitindo avaliações técnicas precisas e geração automática de laudos de preço.

## 🚀 Principais Funcionalidades

### 1. Avaliação Técnica Profissional

Sistema de Pontuação (0-100): Avalie 5 pilares fundamentais (Localização, Imóvel, Construção, Vizinhança, Potencial).

Pesos Inteligentes: O sistema pondera automaticamente cada critério.

Classificação Automática: O imóvel é categorizado (ex: "Imóvel Premium", "Ótima Oportunidade", "Necessita Ajuste") com base na nota.

### 2. Algoritmo de Precificação Dinâmico

O sistema sugere um valor de venda cruzando o preço médio da região com a nota técnica do imóvel, aplicando fatores de correção:

Ágio/Deságio: Imóveis com nota > 50 valorizam sobre a média; < 50 sofrem depreciação.

Fator Rural: Aplica automaticamente um desconto de -5% se o imóvel for rural.

Fator Conforto Térmico: Aplica uma valorização de +5% para imóveis "Nascente" (Sol da manhã).

### 3. Calculadora de Áreas Avançada

Terrenos Regulares: Cálculo automático (Frente × Lateral).

Terrenos Irregulares: Estimativa baseada na média das dimensões (Frente, Fundos, Lat. Direita, Lat. Esquerda).

Formatação Automática: Aceita input direto de números e formata para padrão BRL/Métrico.

### 4. Inteligência de Dados

Idade do Imóvel: Classificação automática (Na Planta, Novo, Seminovo, Antigo) baseada no ano de construção.

Checklist de Conveniências: Seleção rápida de POIs (Hospitais, Escolas, etc.) que compõem o relatório.

Integração com Mapas: Botões diretos para abrir o endereço no Google Maps e buscar pontos de interesse.

### 5. Relatórios e Compartilhamento

Laudo Instantâneo: Gera um texto formatado com todos os dados técnicos, pontos fortes, pontos de atenção e sugestão de preço.

Botões de Ação: Copiar para área de transferência ou Compartilhar direto via WhatsApp/Apps nativos.

## 📱 Estrutura da Aplicação

A navegação é dividida em 5 abas estratégicas:

DADOS 🏠

Cadastro do imóvel (Tipo, Endereço).

Definição de perfil (Urbano/Rural, Nascente/Poente).

Input de valores de mercado.

Cálculo de áreas.

TÉCNICA 📏

Avaliação detalhada com sliders táteis.

Critérios: Localização, Terreno, Construção, Vizinhança.

POTENCIAL 📈

Avaliação estratégica para investidores (Expansão urbana, liquidez, valorização histórica).

RESUMO ✅

Painel visual com a Nota Final.

Destaques automáticos (Top 3 Pontos Fortes e Fracos).

PREÇO 💰

Memória de cálculo detalhada.

Faixa de negociação (Mínimo e Máximo).

Ajuste fino de sensibilidade de mercado.

## 🛠️ Tecnologias Utilizadas

Core: React.js + Vite

Estilização: Tailwind CSS (via classes utilitárias) + CSS Modules

Ícones: Lucide React

Tipografia: Fonte Montserrat (Google Fonts)

Deploy/Build: Preparado para Capacitor (Android/iOS) ou Vercel (Web)

## 📄 Licença

Desenvolvido exclusivamente para uso profissional.
