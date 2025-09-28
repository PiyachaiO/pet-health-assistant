-- =====================================================
-- Migration: Current Schema for Pet Health Assistant
-- Date: 2025-08-09 18:30:54
-- Description: Complete database schema with RLS policies
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
create type "public"."appointment_status" as enum ('scheduled', 'confirmed', 'completed', 'cancelled');

create type "public"."appointment_type" as enum ('checkup', 'vaccination', 'consultation', 'surgery', 'emergency');

create type "public"."approval_status" as enum ('pending', 'approved', 'rejected');

create type "public"."gender_type" as enum ('male', 'female', 'unknown');

create type "public"."notification_type" as enum ('vaccination_due', 'medication_reminder', 'appointment_reminder', 'checkup_due');

create type "public"."priority_level" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."record_type" as enum ('vaccination', 'medication', 'checkup', 'surgery', 'illness', 'injury');

create type "public"."user_role" as enum ('user', 'veterinarian', 'admin');

-- Create tables
create table "public"."appointments" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "pet_id" uuid,
    "veterinarian_id" uuid,
    "appointment_type" appointment_type not null,
    "appointment_date" timestamp with time zone not null,
    "status" appointment_status default 'scheduled'::appointment_status,
    "notes" text,
    "diagnosis" text,
    "treatment" text,
    "approval_status" approval_status default 'pending'::approval_status,
    "approved_by" uuid,
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "reason" text,
    "vet_id" uuid
);


create table "public"."articles" (
    "id" uuid not null default uuid_generate_v4(),
    "author_id" uuid,
    "title" character varying(255) not null,
    "excerpt" text,
    "content" text not null,
    "category" character varying(100) not null,
    "featured_image_url" text,
    "is_published" boolean default false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."health_records" (
    "id" uuid not null default uuid_generate_v4(),
    "pet_id" uuid,
    "record_type" record_type not null,
    "title" character varying(255) not null,
    "description" text,
    "record_date" date not null,
    "next_due_date" date,
    "veterinarian_id" uuid,
    "attachments" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "diagnosis" text,
    "notes" text,
    "treatment" text,
    "weight" numeric(5,2)
);


create table "public"."notifications" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "pet_id" uuid,
    "notification_type" notification_type not null,
    "title" character varying(255) not null,
    "message" text not null,
    "due_date" date,
    "priority" priority_level default 'medium'::priority_level,
    "is_read" boolean default false,
    "is_completed" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."nutrition_guidelines" (
    "id" uuid not null default uuid_generate_v4(),
    "veterinarian_id" uuid,
    "species" character varying(100) not null,
    "age_range" character varying(50) not null,
    "daily_calories" integer not null,
    "protein_percentage" numeric(5,2) not null,
    "fat_percentage" numeric(5,2) not null,
    "feeding_frequency" integer not null,
    "instructions" text,
    "approval_status" approval_status default 'pending'::approval_status,
    "approved_by" uuid,
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."pet_nutrition_plans" (
    "id" uuid not null default uuid_generate_v4(),
    "pet_id" uuid,
    "guideline_id" uuid,
    "veterinarian_id" uuid,
    "custom_calories" integer,
    "custom_instructions" text,
    "start_date" date default CURRENT_DATE,
    "end_date" date,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."pets" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "name" character varying(255) not null,
    "species" character varying(100) not null,
    "breed" character varying(100),
    "birth_date" date,
    "gender" gender_type,
    "weight" numeric(5,2),
    "color" character varying(100),
    "microchip_id" character varying(50),
    "photo_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "email" character varying(255) not null,
    "password_hash" character varying(255) not null,
    "full_name" character varying(255) not null,
    "role" user_role default 'user'::user_role,
    "phone" character varying(20),
    "address" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);

-- Create indexes
CREATE UNIQUE INDEX appointments_pkey ON public.appointments USING btree (id);

CREATE UNIQUE INDEX articles_pkey ON public.articles USING btree (id);

CREATE UNIQUE INDEX health_records_pkey ON public.health_records USING btree (id);

CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);

CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);

CREATE INDEX idx_appointments_veterinarian_id ON public.appointments USING btree (veterinarian_id);

CREATE INDEX idx_articles_category ON public.articles USING btree (category);

CREATE INDEX idx_articles_published ON public.articles USING btree (is_published);

CREATE INDEX idx_health_records_pet_id ON public.health_records USING btree (pet_id);

CREATE INDEX idx_notifications_due_date ON public.notifications USING btree (due_date);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_pets_user_id ON public.pets USING btree (user_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX nutrition_guidelines_pkey ON public.nutrition_guidelines USING btree (id);

CREATE UNIQUE INDEX pet_nutrition_plans_pkey ON public.pet_nutrition_plans USING btree (id);

CREATE UNIQUE INDEX pets_pkey ON public.pets USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

-- Add foreign key constraints
alter table "public"."appointments" add constraint "appointments_pkey" PRIMARY KEY using index "appointments_pkey";

alter table "public"."articles" add constraint "articles_pkey" PRIMARY KEY using index "articles_pkey";

alter table "public"."health_records" add constraint "health_records_pkey" PRIMARY KEY using index "health_records_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."nutrition_guidelines" add constraint "nutrition_guidelines_pkey" PRIMARY KEY using index "nutrition_guidelines_pkey";

alter table "public"."pet_nutrition_plans" add constraint "pet_nutrition_plans_pkey" PRIMARY KEY using index "pet_nutrition_plans_pkey";

alter table "public"."pets" add constraint "pets_pkey" PRIMARY KEY using index "pets_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

-- ลบ duplicate foreign key constraints
alter table "public"."appointments" add constraint "appointments_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES users(id) not valid;

alter table "public"."appointments" validate constraint "appointments_approved_by_fkey";

alter table "public"."appointments" add constraint "appointments_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE not valid;

alter table "public"."appointments" validate constraint "appointments_pet_id_fkey";

alter table "public"."appointments" add constraint "appointments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."appointments" validate constraint "appointments_user_id_fkey";

alter table "public"."appointments" add constraint "appointments_veterinarian_id_fkey" FOREIGN KEY (veterinarian_id) REFERENCES users(id) not valid;

alter table "public"."appointments" validate constraint "appointments_veterinarian_id_fkey";

-- ลบ duplicate constraints เหล่านี้
-- alter table "public"."appointments" add constraint "fk_appointments_user" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;
-- alter table "public"."appointments" validate constraint "fk_appointments_user";
-- alter table "public"."appointments" add constraint "fk_appointments_vet" FOREIGN KEY (veterinarian_id) REFERENCES users(id) not valid;
-- alter table "public"."appointments" validate constraint "fk_appointments_vet";

alter table "public"."articles" add constraint "articles_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."articles" validate constraint "articles_author_id_fkey";

alter table "public"."health_records" add constraint "health_records_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE not valid;

alter table "public"."health_records" validate constraint "health_records_pet_id_fkey";

alter table "public"."health_records" add constraint "health_records_veterinarian_id_fkey" FOREIGN KEY (veterinarian_id) REFERENCES users(id) not valid;

alter table "public"."health_records" validate constraint "health_records_veterinarian_id_fkey";

alter table "public"."notifications" add constraint "notifications_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_pet_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."nutrition_guidelines" add constraint "nutrition_guidelines_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES users(id) not valid;

alter table "public"."nutrition_guidelines" validate constraint "nutrition_guidelines_approved_by_fkey";

alter table "public"."nutrition_guidelines" add constraint "nutrition_guidelines_veterinarian_id_fkey" FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."nutrition_guidelines" validate constraint "nutrition_guidelines_veterinarian_id_fkey";

alter table "public"."pet_nutrition_plans" add constraint "pet_nutrition_plans_guideline_id_fkey" FOREIGN KEY (guideline_id) REFERENCES nutrition_guidelines(id) not valid;

alter table "public"."pet_nutrition_plans" validate constraint "pet_nutrition_plans_guideline_id_fkey";

alter table "public"."pet_nutrition_plans" add constraint "pet_nutrition_plans_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE not valid;

alter table "public"."pet_nutrition_plans" validate constraint "pet_nutrition_plans_pet_id_fkey";

alter table "public"."pet_nutrition_plans" add constraint "pet_nutrition_plans_veterinarian_id_fkey" FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."pet_nutrition_plans" validate constraint "pet_nutrition_plans_veterinarian_id_fkey";

alter table "public"."pets" add constraint "pets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."pets" validate constraint "pets_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

-- Add update_updated_at_column function
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- Add RLS policies
grant delete on table "public"."appointments" to "anon";

grant insert on table "public"."appointments" to "anon";

grant references on table "public"."appointments" to "anon";

grant select on table "public"."appointments" to "anon";

grant trigger on table "public"."appointments" to "anon";

grant truncate on table "public"."appointments" to "anon";

grant update on table "public"."appointments" to "anon";

grant delete on table "public"."appointments" to "authenticated";

grant insert on table "public"."appointments" to "authenticated";

grant references on table "public"."appointments" to "authenticated";

grant select on table "public"."appointments" to "authenticated";

grant trigger on table "public"."appointments" to "authenticated";

grant truncate on table "public"."appointments" to "authenticated";

grant update on table "public"."appointments" to "authenticated";

grant delete on table "public"."appointments" to "service_role";

grant insert on table "public"."appointments" to "service_role";

grant references on table "public"."appointments" to "service_role";

grant select on table "public"."appointments" to "service_role";

grant trigger on table "public"."appointments" to "service_role";

grant truncate on table "public"."appointments" to "service_role";

grant update on table "public"."appointments" to "service_role";

grant delete on table "public"."articles" to "anon";

grant insert on table "public"."articles" to "anon";

grant references on table "public"."articles" to "anon";

grant select on table "public"."articles" to "anon";

grant trigger on table "public"."articles" to "anon";

grant truncate on table "public"."articles" to "anon";

grant update on table "public"."articles" to "anon";

grant delete on table "public"."articles" to "authenticated";

grant insert on table "public"."articles" to "authenticated";

grant references on table "public"."articles" to "authenticated";

grant select on table "public"."articles" to "authenticated";

grant trigger on table "public"."articles" to "authenticated";

grant truncate on table "public"."articles" to "authenticated";

grant update on table "public"."articles" to "authenticated";

grant delete on table "public"."articles" to "service_role";

grant insert on table "public"."articles" to "service_role";

grant references on table "public"."articles" to "service_role";

grant select on table "public"."articles" to "service_role";

grant trigger on table "public"."articles" to "service_role";

grant truncate on table "public"."articles" to "service_role";

grant update on table "public"."articles" to "service_role";

grant delete on table "public"."health_records" to "anon";

grant insert on table "public"."health_records" to "anon";

grant references on table "public"."health_records" to "anon";

grant select on table "public"."health_records" to "anon";

grant trigger on table "public"."health_records" to "anon";

grant truncate on table "public"."health_records" to "anon";

grant update on table "public"."health_records" to "anon";

grant delete on table "public"."health_records" to "authenticated";

grant insert on table "public"."health_records" to "authenticated";

grant references on table "public"."health_records" to "authenticated";

grant select on table "public"."health_records" to "authenticated";

grant trigger on table "public"."health_records" to "authenticated";

grant truncate on table "public"."health_records" to "authenticated";

grant update on table "public"."health_records" to "authenticated";

grant delete on table "public"."health_records" to "service_role";

grant insert on table "public"."health_records" to "service_role";

grant references on table "public"."health_records" to "service_role";

grant select on table "public"."health_records" to "service_role";

grant trigger on table "public"."health_records" to "service_role";

grant truncate on table "public"."health_records" to "service_role";

grant update on table "public"."health_records" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."nutrition_guidelines" to "anon";

grant insert on table "public"."nutrition_guidelines" to "anon";

grant references on table "public"."nutrition_guidelines" to "anon";

grant select on table "public"."nutrition_guidelines" to "anon";

grant trigger on table "public"."nutrition_guidelines" to "anon";

grant truncate on table "public"."nutrition_guidelines" to "anon";

grant update on table "public"."nutrition_guidelines" to "anon";

grant delete on table "public"."nutrition_guidelines" to "authenticated";

grant insert on table "public"."nutrition_guidelines" to "authenticated";

grant references on table "public"."nutrition_guidelines" to "authenticated";

grant select on table "public"."nutrition_guidelines" to "authenticated";

grant trigger on table "public"."nutrition_guidelines" to "authenticated";

grant truncate on table "public"."nutrition_guidelines" to "authenticated";

grant update on table "public"."nutrition_guidelines" to "authenticated";

grant delete on table "public"."nutrition_guidelines" to "service_role";

grant insert on table "public"."nutrition_guidelines" to "service_role";

grant references on table "public"."nutrition_guidelines" to "service_role";

grant select on table "public"."nutrition_guidelines" to "service_role";

grant trigger on table "public"."nutrition_guidelines" to "service_role";

grant truncate on table "public"."nutrition_guidelines" to "service_role";

grant update on table "public"."nutrition_guidelines" to "service_role";

grant delete on table "public"."pet_nutrition_plans" to "anon";

grant insert on table "public"."pet_nutrition_plans" to "anon";

grant references on table "public"."pet_nutrition_plans" to "anon";

grant select on table "public"."pet_nutrition_plans" to "anon";

grant trigger on table "public"."pet_nutrition_plans" to "anon";

grant truncate on table "public"."pet_nutrition_plans" to "anon";

grant update on table "public"."pet_nutrition_plans" to "anon";

grant delete on table "public"."pet_nutrition_plans" to "authenticated";

grant insert on table "public"."pet_nutrition_plans" to "authenticated";

grant references on table "public"."pet_nutrition_plans" to "authenticated";

grant select on table "public"."pet_nutrition_plans" to "authenticated";

grant trigger on table "public"."pet_nutrition_plans" to "authenticated";

grant truncate on table "public"."pet_nutrition_plans" to "authenticated";

grant update on table "public"."pet_nutrition_plans" to "authenticated";

grant delete on table "public"."pet_nutrition_plans" to "service_role";

grant insert on table "public"."pet_nutrition_plans" to "service_role";

grant references on table "public"."pet_nutrition_plans" to "service_role";

grant select on table "public"."pet_nutrition_plans" to "service_role";

grant trigger on table "public"."pet_nutrition_plans" to "service_role";

grant truncate on table "public"."pet_nutrition_plans" to "service_role";

grant update on table "public"."pet_nutrition_plans" to "service_role";

grant delete on table "public"."pets" to "anon";

grant insert on table "public"."pets" to "anon";

grant references on table "public"."pets" to "anon";

grant select on table "public"."pets" to "anon";

grant trigger on table "public"."pets" to "anon";

grant truncate on table "public"."pets" to "anon";

grant update on table "public"."pets" to "anon";

grant delete on table "public"."pets" to "authenticated";

grant insert on table "public"."pets" to "authenticated";

grant references on table "public"."pets" to "authenticated";

grant select on table "public"."pets" to "authenticated";

grant trigger on table "public"."pets" to "authenticated";

grant truncate on table "public"."pets" to "authenticated";

grant update on table "public"."pets" to "authenticated";

grant delete on table "public"."pets" to "service_role";

grant insert on table "public"."pets" to "service_role";

grant references on table "public"."pets" to "service_role";

grant select on table "public"."pets" to "service_role";

grant trigger on table "public"."pets" to "service_role";

grant truncate on table "public"."pets" to "service_role";

grant update on table "public"."pets" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

-- Add policies for specific tables
create policy "Users can insert own appointments"
on "public"."appointments"
as permissive
for insert
to public
with check (((auth.uid())::text = (user_id)::text));


create policy "Users can view own appointments"
on "public"."appointments"
as permissive
for select
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Veterinarians can view assigned appointments"
on "public"."appointments"
as permissive
for select
to public
using (((auth.uid())::text = (veterinarian_id)::text));


create policy "Anyone can view published articles"
on "public"."articles"
as permissive
for select
to public
using ((is_published = true));


create policy "Authors can view own articles"
on "public"."articles"
as permissive
for select
to public
using (((auth.uid())::text = (author_id)::text));


create policy "Users can insert health records for own pets"
on "public"."health_records"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM pets
  WHERE ((pets.id = health_records.pet_id) AND ((pets.user_id)::text = (auth.uid())::text)))));


create policy "Users can view own pet health records"
on "public"."health_records"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM pets
  WHERE ((pets.id = health_records.pet_id) AND ((pets.user_id)::text = (auth.uid())::text)))));


create policy "Users can update own notifications"
on "public"."notifications"
as permissive
for update
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Users can view own notifications"
on "public"."notifications"
as permissive
for select
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Users can delete own pets"
on "public"."pets"
as permissive
for delete
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Users can insert own pets"
on "public"."pets"
as permissive
for insert
to public
with check (((auth.uid())::text = (user_id)::text));


create policy "Users can update own pets"
on "public"."pets"
as permissive
for update
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Users can view own pets"
on "public"."pets"
as permissive
for select
to public
using (((auth.uid())::text = (user_id)::text));


create policy "Users can update own profile"
on "public"."users"
as permissive
for update
to public
using (((auth.uid())::text = (id)::text));


create policy "Users can view own profile"
on "public"."users"
as permissive
for select
to public
using (((auth.uid())::text = (id)::text));

-- Add triggers for updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_guidelines_updated_at BEFORE UPDATE ON public.nutrition_guidelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_nutrition_plans_updated_at BEFORE UPDATE ON public.pet_nutrition_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มตาราง admin_approvals สำหรับการอนุมัติ
CREATE TABLE IF NOT EXISTS public.admin_approvals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  table_name character varying(100) NOT NULL,
  record_id uuid NOT NULL,
  action character varying(50) NOT NULL, -- 'create', 'update', 'delete'
  status approval_status DEFAULT 'pending',
  requested_by uuid REFERENCES public.users(id),
  approved_by uuid REFERENCES public.users(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_approvals_pkey PRIMARY KEY (id)
);

-- เพิ่ม indexes และ constraints สำหรับ admin_approvals
CREATE INDEX idx_admin_approvals_status ON public.admin_approvals USING btree (status);
CREATE INDEX idx_admin_approvals_table_record ON public.admin_approvals USING btree (table_name, record_id);

-- เพิ่ม RLS สำหรับตารางที่ยังไม่มี
ALTER TABLE public.nutrition_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

-- เพิ่ม RLS สำหรับตารางหลักที่ยังไม่มี
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies สำหรับ nutrition_guidelines
CREATE POLICY "Public can view approved nutrition guidelines" ON public.nutrition_guidelines
    FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Vets can manage own guidelines" ON public.nutrition_guidelines
    FOR ALL USING (auth.uid() = veterinarian_id);

CREATE POLICY "Admins can manage all guidelines" ON public.nutrition_guidelines
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ pet_nutrition_plans
CREATE POLICY "Users can view own pet nutrition plans" ON public.pet_nutrition_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets 
            WHERE pets.id = pet_nutrition_plans.pet_id 
            AND pets.user_id = auth.uid()
        )
    );

CREATE POLICY "Vets can view nutrition plans they created" ON public.pet_nutrition_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nutrition_guidelines 
            WHERE nutrition_guidelines.id = pet_nutrition_plans.guideline_id 
            AND nutrition_guidelines.veterinarian_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all nutrition plans" ON public.pet_nutrition_plans
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ admin_approvals
CREATE POLICY "Admins can view all approvals" ON public.admin_approvals
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view own approval requests" ON public.admin_approvals
    FOR SELECT USING (auth.uid() = requested_by);

-- เพิ่ม trigger สำหรับ admin_approvals
CREATE TRIGGER update_admin_approvals_updated_at 
    BEFORE UPDATE ON public.admin_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่ม grants สำหรับ admin_approvals
GRANT ALL ON public.admin_approvals TO anon, authenticated, service_role;

-- Policies สำหรับ appointments (เพิ่มเติม)
CREATE POLICY "Users can update own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Veterinarians can update assigned appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = veterinarian_id);

CREATE POLICY "Admins can manage all appointments" ON public.appointments
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ articles (เพิ่มเติม)
CREATE POLICY "Authors can manage own articles" ON public.articles
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all articles" ON public.articles
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ health_records (เพิ่มเติม)
CREATE POLICY "Veterinarians can view health records they created" ON public.health_records
    FOR SELECT USING (auth.uid() = veterinarian_id);

CREATE POLICY "Admins can manage all health records" ON public.health_records
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ notifications (เพิ่มเติม)
CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ pets (เพิ่มเติม)
CREATE POLICY "Veterinarians can view pets they have appointments with" ON public.pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments 
            WHERE appointments.pet_id = pets.id 
            AND appointments.veterinarian_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all pets" ON public.pets
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policies สำหรับ users (เพิ่มเติม)
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
