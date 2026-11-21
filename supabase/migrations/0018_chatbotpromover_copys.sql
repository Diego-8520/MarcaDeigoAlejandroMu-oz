-- ====================================================================
-- Migración 0018: copys completos del proyecto PROMOVER (chatbotpromover)
-- Solo actualiza textos y metadatos; las imágenes se gestionan desde el panel.
-- ====================================================================

update projects
set
  title = 'PROMOVER Call Center',
  short_description = 'Plataforma de gestión del call center de una IPS de rehabilitación: lista de espera con colas por operador, chatbot de WhatsApp que recibe solicitudes de cita y lector OCR de órdenes médicas.',
  description = 'Sistema interno para el área de atención al usuario de PROMOVER S.A.S. (sede Cali), una IPS de rehabilitación y terapias. No es solo un chatbot: es el espacio de trabajo diario del call center. Reúne en un mismo panel la recepción de solicitudes por WhatsApp, la revisión de documentos, la distribución del trabajo entre operadores y los indicadores de la sede.

El panel incluye un dashboard de indicadores (tiempo promedio de espera, pacientes en espera activa, casos gestionados por operador, distribución por EPS y alertas documentales); una lista de espera con tres vistas («Mi cola de trabajo», «Bolsa general» y «En gestión por otros»), filtros por EPS, especialidad, estado, documentos y condición declarada, y exportación a CSV; una ficha por solicitud con alertas, reglas de agendamiento a verificar, datos leídos por OCR con corrección humana y control de estado; un módulo de agendas para configurar servicios, horarios y lineamientos que el bot ofrece al paciente; la gestión de usuarios por roles (super administrador, administrador y operativo); y un simulador de WhatsApp para probar la conversación sin depender de la API de Meta.

El bot prepara las solicitudes pero no agenda citas: la asignación final la hace una persona en Visoft, el sistema de agendamiento de la IPS.',
  problem = 'Las solicitudes de cita llegaban por WhatsApp con fotos de órdenes médicas e historias clínicas, y el equipo las revisaba a mano una por una. No había una lista de espera única ni una forma clara de repartir los casos: dos operadores podían tomar la misma solicitud, era difícil saber cuánto llevaba esperando cada paciente y los documentos ilegibles, incompletos o vencidos se detectaban tarde, cuando ya se estaba intentando agendar. Además, al tratarse de datos de salud, cualquier solución tenía que cumplir la Ley 1581 de 2012 sobre datos sensibles.',
  solution = 'Diseñé y desarrollé un panel en Next.js y TypeScript sobre Supabase (PostgreSQL) que funciona como espacio de trabajo del call center:

- Chatbot de WhatsApp con un flujo guiado: autorización de datos, documento, nombre, EPS, servicio, orden médica, historia clínica y plan de tratamiento. La lógica es una función pura con pruebas automatizadas.
- Worker de OCR en Python con Tesseract que corre en un equipo de la sede: lee las órdenes, detecta fecha de vencimiento, autorizaciones posiblemente usadas, historias incompletas («página X de Y») e imágenes borrosas, y genera alertas para revisión humana.
- Lista de espera con colas por operador. Tomar un caso se hace con una función en la base que impide que dos personas tomen la misma solicitud.
- Roles aplicados con RLS en la base de datos: un operativo solo ve la bolsa general y su propia cola, y solo modifica los casos asignados a él.
- Módulo de agendas para que el equipo administre servicios, franjas horarias y reglas sin tocar código, con vista previa de cómo lo verá el paciente.
- Privacidad desde el diseño: las imágenes nunca se guardan en Supabase ni en Vercel, el texto OCR completo no se almacena, y al marcar un caso como gestionado se borran sus datos identificables y se verifica el borrado. Las métricas se guardan solo como agregados anónimos.
- Seguridad: CSP con nonce, límite de intentos de inicio de sesión, cierre de sesión por inactividad, firma HMAC en el webhook y logs sin datos de pacientes.',
  results = 'Piloto funcional publicado en Vercel para la sede Cali, operando con datos ficticios mientras se completa la revisión jurídica de privacidad. El equipo ya tiene en un solo lugar la lista de espera priorizada por tiempo y vencimiento, el reparto de casos sin duplicados y alertas documentales automáticas antes de agendar. Queda pendiente conectar la cuenta oficial de WhatsApp Business (el webhook ya está implementado) y calibrar el OCR con documentos reales anonimizados.',
  status = 'en-desarrollo',
  featured = true,
  published = true,
  demo_url = 'https://chatbotpromover.vercel.app/login',
  repository_url = 'https://github.com/callcenterpromover/CHATBOTPROMOVER',
  technologies = array['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase (PostgreSQL)', 'Python', 'Tesseract OCR', 'WhatsApp Cloud API', 'Vercel', 'Vitest'],
  categories = array['Web Apps', 'Chatbots', 'Automation', 'Data'],
  updated_at = now()
where slug = 'chatbotpromover';
