-- ====================================================================
-- Migración 0011: Carga de Contenido Real Inicial (Self-healing & Idempotente)
-- diegoalejandromunoz.com
-- ====================================================================

-- Asegurar extensiones
create extension if not exists "pgcrypto";

-- ====================================================================
-- Asegurar que las tablas requeridas existan
-- ====================================================================

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text,
  bio text,
  avatar_url text,
  email text,
  phone text,
  location text,
  website text,
  linkedin_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'public read profiles') then
    create policy "public read profiles" on profiles for select using (true);
  end if;
end $$;

create table if not exists profile_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table profile_links enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profile_links' and policyname = 'public read profile_links') then
    create policy "public read profile_links" on profile_links for select using (true);
  end if;
end $$;

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text
);
alter table skills enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'skills' and policyname = 'public read skills') then
    create policy "public read skills" on skills for select using (true);
  end if;
end $$;

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  program text not null,
  start_date date,
  end_date date,
  status text,
  description text
);
alter table education enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'education' and policyname = 'public read education') then
    create policy "public read education" on education for select using (true);
  end if;
end $$;

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  start_date date,
  end_date date,
  description text,
  achievements text[]
);
alter table experiences enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'experiences' and policyname = 'public read experiences') then
    create policy "public read experiences" on experiences for select using (true);
  end if;
end $$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  problem text,
  solution text,
  results text,
  status text not null default 'en-desarrollo',
  featured boolean not null default false,
  published boolean not null default false,
  demo_url text,
  repository_url text,
  technologies text[] not null default '{}',
  categories text[] not null default '{}',
  featured_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table projects enable row level security;
alter table projects add column if not exists technologies text[] not null default '{}';
alter table projects add column if not exists categories text[] not null default '{}';
alter table projects add column if not exists featured_image_url text;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'public read published projects') then
    create policy "public read published projects" on projects for select using (published = true);
  end if;
end $$;

create table if not exists project_skills (
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (project_id, skill_id)
);
alter table project_skills enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'project_skills' and policyname = 'public read project_skills') then
    create policy "public read project_skills" on project_skills for select using (true);
  end if;
end $$;

-- ====================================================================
-- 1. PERFIL
-- ====================================================================
do $$
begin
  if exists (select 1 from profiles) then
    update profiles set
      full_name = 'Diego Alejandro Muñoz Arcos',
      headline = 'Software Developer | C# .NET & React | E-commerce, SEO y Automatización',
      bio = 'Mi trayectoria profesional inició en el área de Seguridad y Salud en el Trabajo, donde desarrollé disciplina, gestión de procesos y capacidad para trabajar en entornos exigentes. Con el tiempo, redirigí mi carrera hacia la tecnología, enfocándome en la creación de soluciones digitales orientadas a resolver problemas reales. Curso Ingeniería de Sistemas en la Institución Universitaria Antonio José Camacho y complemento mi formación con proyectos propios y trabajo freelance para startups y negocios digitales — landing pages, sitios web y tiendas e-commerce, incluyendo APIs en C# conectadas a bases de datos como Supabase. Trabajo con C#, .NET, React, Angular y SQL.',
      email = 'diego_8520@outlook.com',
      phone = '+57 321 515 0904',
      location = 'Cali, Valle del Cauca, Colombia',
      github_url = 'https://github.com/Diego-8520',
      linkedin_url = 'https://www.linkedin.com/in/dalejandromunoz',
      updated_at = now()
    where id = (select id from profiles order by created_at asc limit 1);
  else
    insert into profiles (full_name, headline, bio, email, phone, location, github_url, linkedin_url)
    values (
      'Diego Alejandro Muñoz Arcos',
      'Software Developer | C# .NET & React | E-commerce, SEO y Automatización',
      'Mi trayectoria profesional inició en el área de Seguridad y Salud en el Trabajo, donde desarrollé disciplina, gestión de procesos y capacidad para trabajar en entornos exigentes. Con el tiempo, redirigí mi carrera hacia la tecnología, enfocándome en la creación de soluciones digitales orientadas a resolver problemas reales. Curso Ingeniería de Sistemas en la Institución Universitaria Antonio José Camacho y complemento mi formación con proyectos propios y trabajo freelance para startups y negocios digitales — landing pages, sitios web y tiendas e-commerce, incluyendo APIs en C# conectadas a bases de datos como Supabase. Trabajo con C#, .NET, React, Angular y SQL.',
      'diego_8520@outlook.com',
      '+57 321 515 0904',
      'Cali, Valle del Cauca, Colombia',
      'https://github.com/Diego-8520',
      'https://www.linkedin.com/in/dalejandromunoz'
    );
  end if;
end $$;

-- ====================================================================
-- 2. ENLACES DE PERFIL (profile_links)
-- ====================================================================
insert into profile_links (label, url, icon, sort_order)
select 'GitHub', 'https://github.com/Diego-8520', 'Github', 1
where not exists (select 1 from profile_links where url = 'https://github.com/Diego-8520');

insert into profile_links (label, url, icon, sort_order)
select 'LinkedIn', 'https://www.linkedin.com/in/dalejandromunoz', 'Linkedin', 2
where not exists (select 1 from profile_links where url = 'https://www.linkedin.com/in/dalejandromunoz');

-- ====================================================================
-- 3. HABILIDADES / SKILLS
-- ====================================================================
insert into skills (name, category)
select v.name, v.category from (values
  ('C#', 'Desarrollo'),
  ('.NET', 'Desarrollo'),
  ('React', 'Desarrollo'),
  ('Angular', 'Desarrollo'),
  ('JavaScript', 'Desarrollo'),
  ('TypeScript', 'Desarrollo'),
  ('HTML5', 'Desarrollo'),
  ('CSS3', 'Desarrollo'),
  ('Node.js', 'Desarrollo'),
  ('Entity Framework', 'Desarrollo'),
  ('LINQ', 'Desarrollo'),
  ('Java', 'Desarrollo'),
  ('Python', 'Desarrollo'),
  ('MySQL', 'Bases de datos'),
  ('SQL', 'Bases de datos'),
  ('Supabase (PostgreSQL)', 'Bases de datos'),
  ('Git/GitHub', 'Herramientas'),
  ('APIs REST', 'Herramientas'),
  ('JWT', 'Herramientas'),
  ('Vite', 'Herramientas'),
  ('Astro', 'Herramientas'),
  ('Canva', 'Herramientas'),
  ('Prompt Engineering', 'IA'),
  ('Claude Agent SDK', 'IA'),
  ('AWS AI Practitioner', 'IA')
) as v(name, category)
where not exists (select 1 from skills s where lower(s.name) = lower(v.name));

-- ====================================================================
-- 4. EDUCACIÓN
-- ====================================================================
insert into education (institution, program, start_date, end_date, status, description)
select v.institution, v.program, v.start_date::date, v.end_date::date, v.status, v.description
from (values
  (
    'Institución Universitaria Antonio José Camacho (UNIAJC)',
    'Ingeniería en Sistemas de Información',
    '2024-02-01',
    '2029-06-30',
    'En curso',
    'Formación profesional universitaria con enfoque en desarrollo de software, arquitectura de sistemas de información, bases de datos y algoritmos.'
  ),
  (
    'SENA',
    'Tecnólogo en Seguridad y Salud en el Trabajo',
    '2019-01-01',
    '2021-12-31',
    'Completado',
    'Formación tecnológica enfocada en normatividad, diseño de sistemas de gestión de seguridad y salud, control de riesgos e inspección de procesos.'
  ),
  (
    'SENA',
    'Tecnólogo en Análisis y Desarrollo de Software',
    '2024-01-01',
    null,
    'No finalizado',
    'Formación técnica en análisis de requerimientos, diseño y desarrollo de aplicaciones de software, cursado de forma paralela a la carrera universitaria.'
  )
) as v(institution, program, start_date, end_date, status, description)
where not exists (
  select 1 from education e
  where lower(e.institution) = lower(v.institution)
    and lower(e.program) = lower(v.program)
);

-- ====================================================================
-- 5. EXPERIENCIA LABORAL
-- ====================================================================
insert into experiences (company, position, start_date, end_date, description, achievements)
select
  v.company,
  v.position,
  v.start_date::date,
  v.end_date::date,
  v.description,
  v.achievements
from (values
  (
    'Juniper Travel Technology',
    'Mapping Agent',
    '2024-11-01',
    '2026-04-30',
    'Gestión, normalización y mapeo de contenido hotelero y turístico en plataformas globales de distribución. Homologación de inventarios entre proveedores y clientes mediante herramientas de integración y bases de datos, garantizando consistencia, precisión de datos y disponibilidad en tiempo real.',
    array[
      'Mapeo y reconciliación de catálogos masivos de hoteles, tarifas y habitaciones provenientes de múltiples proveedores XML/APIs.',
      'Detección y resolución de discrepancias en datos geoespaciales y atributos comerciales para evitar fallos de reserva.',
      'Optimización de flujos de verificación de datos para reducir tiempos de publicación en motores de búsqueda turísticos.'
    ]
  ),
  (
    'Consultora de Recursos Humanos Nexo SAS',
    'Auxiliar de prevención de riesgos',
    '2022-07-01',
    '2024-11-01',
    'Apoyo en la formulación, implementación y seguimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para empresas clientes. Levantamiento de matrices de riesgos, reporte e investigación de incidentes laborales y ejecución de inspecciones periódicas.',
    array[
      'Diseño y actualización de matrices de identificación de peligros y valoración de riesgos (GTC 45) en diversos sectores.',
      'Estructuración de indicadores de gestión, planes de trabajo anuales y auditorías de cumplimiento normativo legal.',
      'Capacitación continua a comités paritarios (COPASST) y personal operativo en protocolos de prevención y emergencias.'
    ]
  ),
  (
    'Unión Temporal 2021',
    'Encargado de seguridad, salud ocupacional y medioambiente',
    '2021-06-01',
    '2022-06-30',
    'Liderazgo en campo del programa de seguridad y salud en el trabajo y gestión ambiental en proyectos operativos. Supervisión directa del cumplimiento de normas de protección personal, permisos para tareas de alto riesgo y control ambiental.',
    array[
      'Supervisión diaria de tareas de alto riesgo (trabajo en alturas, espacios confinados) manteniendo cero incidentes graves.',
      'Coordinación de brigadas de emergencia y simulacros de evacuación en frentes operativos.',
      'Control de residuos y aseguramiento del cumplimiento de la normatividad ambiental aplicable.'
    ]
  ),
  (
    'Gran Langostino SA',
    'Aprendiz de Seguridad y Salud en el Trabajo',
    '2021-01-01',
    '2021-06-30',
    'Etapa productiva de formación técnica. Acompañamiento en la inspección de instalaciones, puestos de trabajo y líneas de procesamiento de alimentos, verificando condiciones seguras y uso adecuado de EPP.',
    array[
      'Apoyo en la documentación de procedimientos estándar de seguridad e higiene industrial para planta de alimentos.',
      'Registro y seguimiento de exámenes médicos ocupacionales y dotación de elementos de protección individual.',
      'Participación en inspecciones de orden, aseo y señalización en áreas de almacenamiento y refrigeración.'
    ]
  )
) as v(company, position, start_date, end_date, description, achievements)
where not exists (
  select 1 from experiences ex
  where lower(ex.company) = lower(v.company)
    and lower(ex.position) = lower(v.position)
);

-- ====================================================================
-- 6. PROYECTOS
-- ====================================================================
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
values
(
  'Safe Maps',
  'safe-maps',
  'Plataforma web de análisis de riesgo urbano para rutas en Cali, Colombia.',
  'Aplicación interactiva que permite a los ciudadanos evaluar y visualizar niveles de riesgo urbano en rutas de desplazamiento en Cali, combinando cálculo de rutas reales mediante OpenRouteService y modelado de riesgo acumulado.',
  'Los ciudadanos carecen de herramientas accesibles para evaluar la seguridad de sus trayectos urbanos antes de desplazarse, especialmente en zonas de alta vulnerabilidad.',
  'Desarrollo de una plataforma web con visualización cartográfica en tiempo real, integración de OpenRouteService para geometrías de ruta precisas y análisis de riesgo por comunas.',
  'Interfaz responsiva y fluida con cálculo dinámico de trayectorias, visualización por niveles de riesgo y analítica geoespacial para la ciudad de Cali.',
  'live',
  true,
  true,
  'https://safe-maps-two.vercel.app/map',
  'https://github.com/Diego-8520/safe-maps',
  array['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'OpenRouteService'],
  array['Web Apps', 'Data']
),
(
  'Pura Pasión V2',
  'pura-pasion-v2',
  'Plataforma e-commerce y catálogo digital para marca de indumentaria deportiva.',
  'Segunda generación de la tienda digital de Pura Pasión, rediseñada con arquitectura moderna, catálogo optimizado, panel administrativo y gestión de inventario en tiempo real con Supabase.',
  'La versión previa requería modernización en rendimiento, experiencia de compra en dispositivos móviles y una base de datos escalable con autenticación segura.',
  'Reconstrucción integral con Next.js App Router, TypeScript, Tailwind CSS y Supabase (Postgres + Auth + Storage), con Server Actions y validación tipada.',
  'Mejora radical en tiempos de carga, administración centralizada de productos y una experiencia de navegación optimizada para conversión.',
  'live',
  true,
  true,
  null,
  'https://github.com/Diego-8520/PuraPasionV2',
  array['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase (PostgreSQL)'],
  array['E-commerce', 'Web Apps']
),
(
  'Budix Inc — UpSales LP',
  'upsales-budix',
  'Landing page comercial de alta conversión construida con Vite y React.',
  'Página de aterrizaje optimizada para conversión de prospectos y presentación de soluciones digitales de Budix Inc, con arquitectura modular y tiempos de carga ultrarrápidos.',
  'Necesidad de captar leads calificados mediante una presencia web ágil, persuasiva y con altos estándares de rendimiento en Core Web Vitals.',
  'Desarrollo frontend con Vite, React y Tailwind CSS, estructurado con llamadas a la acción estratégicas y diseño enfocado en la experiencia de usuario.',
  'Carga instantánea, código desacoplado y un flujo de conversión intuitivo para clientes potenciales.',
  'live',
  false,
  true,
  null,
  'https://github.com/Diego-8520/UpSalesLP',
  array['Vite', 'React', 'Tailwind CSS', 'JavaScript'],
  array['Web Apps']
),
(
  'NexFlow Connect',
  'nexflow-connect',
  'Landing page para servicios de automatización e integración con Astro.',
  'Portal web para exhibición de soluciones de integración tecnológica y automatización empresarial, aprovechando la arquitectura de islas y cero JavaScript innecesario de Astro.',
  'Exhibir servicios técnicos de integración con máxima velocidad y optimización SEO orgánica.',
  'Implementación con Astro y Tailwind CSS, garantizando entrega estática de alto rendimiento y accesibilidad.',
  'Puntajes sobresalientes de rendimiento en métricas web y presentación clara de la oferta comercial.',
  'live',
  false,
  true,
  null,
  'https://github.com/Diego-8520/NexFlowConnectLP',
  array['Astro', 'Tailwind CSS', 'HTML5', 'CSS3'],
  array['Automation', 'Web Apps']
),
(
  'MetaAhorro',
  'meta-ahorro',
  'Aplicación de seguimiento y planificación de metas de ahorro financiero.',
  'Plataforma para fijar, monitorear y proyectar objetivos de ahorro personal con sincronización en la nube mediante Angular y Firebase.',
  'Dificultad de los usuarios para mantener constancia y visualizar el progreso real hacia sus metas financieras.',
  'Aplicación web construida en Angular con autenticación y base de datos en tiempo real de Firebase, incluyendo paneles de cálculo de avance.',
  'Registro intuitivo de transacciones, visualización gráfica de metas y sincronización inmediata.',
  'live',
  false,
  true,
  null,
  'https://github.com/Diego-8520/MetaAhorroProject',
  array['Angular', 'Firebase', 'TypeScript', 'CSS3'],
  array['Web Apps']
),
(
  'Pura Pasión Web (v1)',
  'pura-pasion-v1',
  'Primera versión del sitio web y catálogo comercial desarrollado con .NET y JS.',
  'Versión fundacional del portal de Pura Pasión, desarrollada con frontend en HTML5/CSS3/JavaScript y backend en .NET / C#.',
  'Establecer la primera presencia digital y vitrina de productos de la marca deportiva.',
  'Implementación de catálogo de productos interactivo conectado a servicios en C# .NET.',
  'Primera validación comercial del negocio en línea que sentó las bases para la arquitectura de la V2.',
  'archivado',
  false,
  true,
  null,
  'https://github.com/Diego-8520/ProyectoPuraPasionWeb',
  array['C#', '.NET', 'JavaScript', 'HTML5', 'CSS3'],
  array['E-commerce', 'Web Apps']
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

-- ====================================================================
-- 7. VINCULACIÓN PROYECTOS <-> SKILLS (project_skills)
-- ====================================================================
insert into project_skills (project_id, skill_id)
select p.id, s.id
from projects p
cross join skills s
where s.name = any(p.technologies)
on conflict (project_id, skill_id) do nothing;
