-- ====================================================================
-- Migración 0014: Actualización de copys y posicionamiento profesional
-- diegoalejandromunoz.com
-- ====================================================================

-- PERFIL
update profiles
set
  headline = 'Software Developer | Next.js & TypeScript | Web, Datos y Automatización',
  bio = 'Estudiante de Ingeniería de Sistemas en la Institución Universitaria Antonio José Camacho (UNIAJC). Desarrollo aplicaciones web funcionales, paneles administrativos y herramientas con Next.js, React, TypeScript y Supabase/PostgreSQL. Mi trayectoria previa en Seguridad y Salud en el Trabajo, soporte operativo de datos y proyectos digitales me aporta criterio práctico para entender procesos reales, ordenar información y construir soluciones útiles sin sobredimensionar el alcance.',
  updated_at = now()
where id = (
  select id
  from profiles
  order by created_at asc
  limit 1
);

-- HABILIDADES: retirar señales de IA madura no respaldadas por proyectos publicados.
delete from project_skills
where skill_id in (
  select id
  from skills
  where name in ('Prompt Engineering', 'Claude Agent SDK', 'AWS AI Practitioner')
);

delete from skills
where name in ('Prompt Engineering', 'Claude Agent SDK', 'AWS AI Practitioner');

-- EXPERIENCIA
update experiences
set
  position = 'Mapping Agent / Soporte Operativo de Datos',
  end_date = null,
  description = 'Verificación de calidad, consistencia de inventario y resolución de discrepancias en información hotelera y turística. Atención de solicitudes operativas, revisión de datos de producto y soporte para mantener información confiable dentro de sistemas de distribución.',
  achievements = array[
    'Mapeo, configuración y validación de información hotelera y turística.',
    'Detección y resolución de discrepancias en datos de producto, inventario y atributos comerciales.',
    'Atención de tickets y documentación de solicitudes relacionadas con calidad y consistencia de datos.'
  ]
where lower(company) = lower('Juniper Travel Technology');

insert into experiences (company, position, start_date, end_date, description, achievements)
select
  'UpSales',
  'Responsable de Sistemas y Tecnología',
  '2022-01-01'::date,
  null,
  'Responsable del componente técnico dentro de un equipo pequeño orientado a soluciones digitales, comercio electrónico y presencia web. Desarrollo y mantenimiento de landing pages, sitios e-commerce, infraestructura digital y soporte técnico para operaciones comerciales.',
  array[
    'Desarrollo de sitios web, landing pages y herramientas digitales para iniciativas comerciales.',
    'Apoyo en proyectos de e-commerce, incluyendo reconstrucción web sobre Shopify para Fundación Edén de los Sabios, con alcance específico pendiente de validación.',
    'Investigación y propuesta de mejoras técnicas para publicar, mantener y conectar activos digitales del negocio.'
  ]
where not exists (
  select 1
  from experiences
  where lower(company) = lower('UpSales')
);

update experiences
set
  position = 'Responsable de Sistemas y Tecnología',
  start_date = '2022-01-01'::date,
  end_date = null,
  description = 'Responsable del componente técnico dentro de un equipo pequeño orientado a soluciones digitales, comercio electrónico y presencia web. Desarrollo y mantenimiento de landing pages, sitios e-commerce, infraestructura digital y soporte técnico para operaciones comerciales.',
  achievements = array[
    'Desarrollo de sitios web, landing pages y herramientas digitales para iniciativas comerciales.',
    'Apoyo en proyectos de e-commerce, incluyendo reconstrucción web sobre Shopify para Fundación Edén de los Sabios, con alcance específico pendiente de validación.',
    'Investigación y propuesta de mejoras técnicas para publicar, mantener y conectar activos digitales del negocio.'
  ]
where lower(company) = lower('UpSales');

update experiences
set
  position = 'Asesor SST / Digitalización de Procesos',
  description = 'Apoyo en la formulación, implementación y seguimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para empresas clientes. Esta etapa fortaleció el rigor documental, el seguimiento de indicadores y el acercamiento inicial a formularios digitales y Google Apps Script.',
  achievements = array[
    'Acompañamiento a empresas cliente en documentación, auditorías, planes de trabajo e informes para ARL.',
    'Seguimiento de indicadores, investigación de accidentes y organización de información operativa.',
    'Primer acercamiento a la estandarización de procesos mediante formularios digitales y Google Apps Script.'
  ]
where lower(company) = lower('Consultora de Recursos Humanos Nexo SAS');

-- PROYECTOS
insert into projects (
  title,
  slug,
  short_description,
  description,
  problem,
  solution,
  results,
  status,
  featured,
  published,
  demo_url,
  repository_url,
  technologies,
  categories
)
values (
  'diegoalejandromunoz.com',
  'diegoalejandromunoz-com',
  'Plataforma personal para marca profesional, portafolio y administración de contenido.',
  'Sitio profesional construido como producto propio con Next.js App Router, TypeScript, Tailwind CSS, Supabase/PostgreSQL y Vercel. Incluye páginas públicas, dashboard privado, autenticación, gestión de proyectos, experiencia, CV, enlaces, analítica anónima e integraciones administrativas con GitHub, Vercel y Supabase.',
  'Necesidad de demostrar experiencia técnica con evidencia real y mantener el portafolio actualizado sin editar código en cada cambio de contenido.',
  'Implementación de una aplicación web con dashboard protegido, Server Actions, RLS, almacenamiento de archivos, tracking anónimo de eventos y sincronización de recursos externos para apoyar decisiones editoriales.',
  'Plataforma en producción que centraliza marca personal, proyectos verificables, CV, contacto y administración de contenido desde un panel privado.',
  'live',
  true,
  true,
  'https://www.diegoalejandromunoz.com/',
  'https://github.com/Diego-8520/MarcaDeigoAlejandroMu-oz',
  array['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase (PostgreSQL)'],
  array['Web Apps', 'Data']
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  problem = excluded.problem,
  solution = excluded.solution,
  results = excluded.results,
  status = excluded.status,
  featured = excluded.featured,
  published = excluded.published,
  demo_url = excluded.demo_url,
  repository_url = excluded.repository_url,
  technologies = excluded.technologies,
  categories = excluded.categories,
  updated_at = now();

update projects
set
  short_description = 'Landing page comercial construida con Vite, React y Tailwind CSS.',
  description = 'Página de aterrizaje para Budix Inc / UpSales enfocada en presentar servicios digitales y facilitar el contacto comercial, con arquitectura frontend modular y despliegue en Vercel.',
  problem = 'Necesidad de comunicar una oferta comercial de forma clara y publicar una presencia web ágil para captar conversaciones con prospectos.',
  solution = 'Desarrollo frontend con Vite, React y Tailwind CSS, estructura responsive, secciones comerciales y llamadas a la acción directas.',
  results = 'Landing page publicada con repositorio público y base reutilizable para comunicación comercial.',
  technologies = array['Vite', 'React', 'Tailwind CSS', 'JavaScript'],
  categories = array['Web Apps'],
  updated_at = now()
where slug = 'upsales-budix';

update projects
set
  results = 'Proyecto académico/técnico con interfaz responsiva, cálculo de rutas y visualización de niveles de riesgo para explorar decisiones de producto basadas en datos geográficos.',
  updated_at = now()
where slug = 'safe-maps';

update projects
set
  short_description = 'E-commerce y catálogo digital para marca de indumentaria deportiva.',
  results = 'Proyecto propio en evolución para practicar catálogo, administración de productos y persistencia con Supabase.',
  updated_at = now()
where slug = 'pura-pasion-v2';

insert into project_skills (project_id, skill_id)
select p.id, s.id
from projects p
cross join skills s
where p.slug = 'diegoalejandromunoz-com'
  and s.name = any(p.technologies)
on conflict (project_id, skill_id) do nothing;
