"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUserById, updateUser, toMediaUrl, changePassword, register } from "@/lib/api";
import { useAdminContext } from "@/components/admin/admin-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminUserFormPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const isNew = params.id === "new";
	const { selectedUserId, isUserVerified } = useAdminContext();
	const [loading, setLoading] = useState(!isNew);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [shortDescriptions, setShortDescriptions] = useState<string[]>([]);
	const [generalDescription, setGeneralDescription] = useState("");
	const [location, setLocation] = useState("");
	const [linkedInUrl, setLinkedInUrl] = useState("");
	const [gitHubUrl, setGitHubUrl] = useState("");
	const [twitterUrl, setTwitterUrl] = useState("");
	const [facebookUrl, setFacebookUrl] = useState("");
	const [instagramUrl, setInstagramUrl] = useState("");
	const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
	const [experienceLevel, setExperienceLevel] = useState("");

	type SkillCat = { id?: number; category: string; skillsText: string };
	type ExperienceItem = { id?: number; company: string; position: string; period: string; location: string; description: string; achievementsText: string };
	type EducationItem = { id?: number; institution: string; degree: string; period: string; description: string };
	type CertificationItem = { id?: number; name: string; issuer: string; date: string };

	const [skillCategories, setSkillCategories] = useState<SkillCat[]>([]);
	const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
	const [educations, setEducations] = useState<EducationItem[]>([]);
	const [certifications, setCertifications] = useState<CertificationItem[]>([]);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	// Para alta: credenciales
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	// Cambio de contraseña (solo edición)
	const [currPw, setCurrPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [newPw2, setNewPw2] = useState("");
	const [changingPw, setChangingPw] = useState(false);

		useEffect(() => {
			// Regla: solo permitir editar si es el propio usuario seleccionado y verificado
			if (!isNew) {
				const targetId = Number(params.id);
				if (!(selectedUserId && isUserVerified && selectedUserId === targetId)) {
					router.replace("/admin/users");
					return;
				}
			}
		if (isNew) return;
		(async () => {
			try {
			const u = await getUserById(Number(params.id));
				setName(u?.name ?? "");
				setEmail(u?.email ?? "");
				setPhone(u?.phone ?? "");
				setUsername(u?.username ?? "");
				setBio(u?.bio ?? "");
			setShortDescriptions(Array.isArray(u?.shortDescriptions) ? u.shortDescriptions : (u?.shortDescriptions ? [String(u.shortDescriptions)] : []));
			setGeneralDescription(u?.generalDescription ?? "");
			setLocation(u?.location ?? "");
			setLinkedInUrl(u?.linkedInUrl ?? u?.linkedinUrl ?? "");
			setGitHubUrl(u?.gitHubUrl ?? u?.githubUrl ?? "");
			setTwitterUrl(u?.twitterUrl ?? "");
			setFacebookUrl(u?.facebookUrl ?? "");
			setInstagramUrl(u?.instagramUrl ?? "");
			setYearsOfExperience(typeof u?.yearsOfExperience === "number" ? u.yearsOfExperience : "");
			setExperienceLevel(u?.experienceLevel ?? "");
			setSkillCategories(Array.isArray(u?.skillCategories) ? u.skillCategories.map((c: any) => ({ id: c.id, category: c.category ?? "", skillsText: Array.isArray(c.skills) ? c.skills.join(", ") : String(c.skills ?? "") })) : []);
			setExperiences(Array.isArray(u?.experiences) ? u.experiences.map((e: any) => ({ id: e.id, company: e.company ?? "", position: e.position ?? "", period: e.period ?? "", location: e.location ?? "", description: e.description ?? "", achievementsText: Array.isArray(e.achievements) ? e.achievements.join(", ") : String(e.achievements ?? "") })) : []);
			setEducations(Array.isArray(u?.educations) ? u.educations.map((ed: any) => ({ id: ed.id, institution: ed.institution ?? "", degree: ed.degree ?? "", period: ed.period ?? "", description: ed.description ?? "" })) : []);
			setCertifications(Array.isArray(u?.certifications) ? u.certifications.map((c: any) => ({ id: c.id, name: c.name ?? "", issuer: c.issuer ?? "", date: c.date ? String(c.date).slice(0,10) : "" })) : []);
          setProfileImageUrl(toMediaUrl(u?.profileImageUrl));
			} catch (e) {
				setError("No se pudo cargar el usuario");
			} finally {
				setLoading(false);
			}
		})();
	}, [isNew, params.id]);

		const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
				try {
					// 1) Preparar payload with-image (create/update)
					let targetId: number | null = isNew ? null : Number(params.id);
					const fd = new FormData();
					fd.append("Name", name);
					if (email) fd.append("Email", email);
					if (phone) fd.append("Phone", phone);
					if (username) fd.append("Username", username);
					if (bio) fd.append("Bio", bio);
					const cleanedShort = shortDescriptions.map(s => s?.trim()).filter(Boolean) as string[];
					cleanedShort.forEach((s, i) => fd.append(`ShortDescriptions[${i}]`, s));
					if (generalDescription) fd.append("GeneralDescription", generalDescription);
					if (location) fd.append("Location", location);
					if (linkedInUrl) fd.append("LinkedInUrl", linkedInUrl);
					if (gitHubUrl) fd.append("GitHubUrl", gitHubUrl);
					if (twitterUrl) fd.append("TwitterUrl", twitterUrl);
					if (facebookUrl) fd.append("FacebookUrl", facebookUrl);
					if (instagramUrl) fd.append("InstagramUrl", instagramUrl);
					if (yearsOfExperience !== "") fd.append("YearsOfExperience", String(yearsOfExperience));
					if (experienceLevel) fd.append("ExperienceLevel", experienceLevel);
					const cleanedSkills = skillCategories.filter(c => (c.category?.trim() || c.skillsText?.trim()));
					cleanedSkills.forEach((c, i) => {
						if (c.id) fd.append(`SkillCategories[${i}].Id`, String(c.id));
						if (c.category?.trim()) fd.append(`SkillCategories[${i}].Category`, c.category.trim());
						if (c.skillsText?.trim()) fd.append(`SkillCategories[${i}].Skills`, c.skillsText.trim());
					});
					const cleanedExps = experiences.filter(ex => (ex.company?.trim() || ex.position?.trim() || ex.period?.trim() || ex.location?.trim() || ex.description?.trim() || ex.achievementsText?.trim()));
					cleanedExps.forEach((ex, i) => {
						if (ex.id) fd.append(`Experiences[${i}].Id`, String(ex.id));
						if (ex.company?.trim()) fd.append(`Experiences[${i}].Company`, ex.company.trim());
						if (ex.position?.trim()) fd.append(`Experiences[${i}].Position`, ex.position.trim());
						if (ex.period?.trim()) fd.append(`Experiences[${i}].Period`, ex.period.trim());
						if (ex.location?.trim()) fd.append(`Experiences[${i}].Location`, ex.location.trim());
						if (ex.description?.trim()) fd.append(`Experiences[${i}].Description`, ex.description.trim());
						if (ex.achievementsText?.trim()) fd.append(`Experiences[${i}].Achievements`, ex.achievementsText.trim());
					});
					const cleanedEdu = educations.filter(ed => (ed.institution?.trim() || ed.degree?.trim() || ed.period?.trim() || ed.description?.trim()));
					cleanedEdu.forEach((ed, i) => {
						if (ed.id) fd.append(`Educations[${i}].Id`, String(ed.id));
						if (ed.institution?.trim()) fd.append(`Educations[${i}].Institution`, ed.institution.trim());
						if (ed.degree?.trim()) fd.append(`Educations[${i}].Degree`, ed.degree.trim());
						if (ed.period?.trim()) fd.append(`Educations[${i}].Period`, ed.period.trim());
						if (ed.description?.trim()) fd.append(`Educations[${i}].Description`, ed.description.trim());
					});
					const cleanedCert = certifications.filter(c => (c.name?.trim() || c.issuer?.trim() || c.date?.trim()));
					cleanedCert.forEach((c, i) => {
						if (c.id) fd.append(`Certifications[${i}].Id`, String(c.id));
						if (c.name?.trim()) fd.append(`Certifications[${i}].Name`, c.name.trim());
						if (c.issuer?.trim()) fd.append(`Certifications[${i}].Issuer`, c.issuer.trim());
						if (c.date?.trim()) fd.append(`Certifications[${i}].Date`, c.date.trim());
					});
					if (imageFile) fd.append("ProfileImage", imageFile);

					if (isNew) {
						// Validar credenciales
						if (!username?.trim()) {
							throw new Error("El usuario es requerido");
						}
						if (!password || password.trim().length < 8) {
							throw new Error("La contraseña debe tener al menos 8 caracteres");
						}
						if (password !== password2) {
							throw new Error("Las contraseñas no coinciden");
						}
						// 1) Registrar credenciales
						const reg = await register({ name, email, phone, username, password });
						// 2) Obtener id del usuario creado desde la respuesta (flexible)
						targetId = Number((reg as any)?.id ?? (reg as any)?.userId ?? (reg as any)?.data?.id);
						if (!Number.isFinite(targetId)) {
							throw new Error("No se pudo obtener el ID del usuario creado");
						}
							// 3) Completar perfil con PUT with-image (incluyendo Id en el form)
							fd.append("Id", String(targetId));
							await updateUser(targetId as number, fd);
						toast.success("Usuario creado correctamente");
						router.push(`/admin/users/${targetId}`);
						return;
					} else {
						// Incluir Id en el form para cumplir con validaciones del backend
						fd.append("Id", String(targetId));
						await updateUser((targetId as number), fd);
						toast.success("Usuario actualizado correctamente");
					}
					router.push("/admin/users");
				} catch (e) {
			const msg = e instanceof Error ? e.message : "No se pudo guardar el usuario";
			setError(msg);
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p className="text-muted-foreground">Cargando…</p>;

	// Determina qué imagen mostrar: la existente o la previsualización
	const avatarUrl = imagePreview || profileImageUrl;

	    return (
		    <form onSubmit={onSubmit} className="space-y-6 max-w-5xl">
				{/* Encabezado */}
					<div className="flex items-center justify-between gap-3 rounded-lg border p-3 bg-muted/30">
					<Avatar className="size-10">
							{avatarUrl ? (
								<AvatarImage src={avatarUrl} alt={name || "Usuario"} />
						) : (
							<AvatarFallback>{(name || "U").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()}</AvatarFallback>
						)}
					</Avatar>
						<div className="flex-1">
						<div className="font-medium leading-tight">{isNew ? "Nuevo usuario" : name || "Usuario"}</div>
						{!isNew && <div className="text-xs text-muted-foreground">{email || "Sin email"}</div>}
					</div>
						<div className="hidden md:flex gap-2">
							<Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
							<Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
						</div>
				</div>
					{/* Secciones en una sola vista */}
					<Card>
						<CardHeader>
							<CardTitle>Datos básicos</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Nombre</label>
									<Input value={name} onChange={(e) => setName(e.target.value)} required />
								</div>
								<div>
									<label className="block text-sm mb-1">Usuario</label>
									<Input value={username} onChange={(e) => setUsername(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Email</label>
									<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Teléfono</label>
									<Input value={phone} onChange={(e) => setPhone(e.target.value)} />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Credenciales (solo en creación) */}
					{isNew && (
						<Card>
							<CardHeader>
								<CardTitle>Credenciales</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm mb-1">Contraseña</label>
										<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
									</div>
									<div>
										<label className="block text-sm mb-1">Confirmar contraseña</label>
										<Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
									</div>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Perfil y bio</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="block text-sm mb-1">Descripción general</label>
								<Textarea rows={3} value={generalDescription} onChange={(e) => setGeneralDescription(e.target.value)} />
							</div>
							<div>
								<label className="block text-sm mb-1">Frases cortas</label>
								<div className="space-y-2">
									{shortDescriptions.map((s, i) => (
										<div key={i} className="flex gap-2">
											<Input value={s} onChange={(e) => { const n=[...shortDescriptions]; n[i]=e.target.value; setShortDescriptions(n); }} />
											<Button type="button" variant="ghost" onClick={() => setShortDescriptions(shortDescriptions.filter((_, idx) => idx !== i))}>Eliminar</Button>
										</div>
									))}
									<Button type="button" variant="outline" size="sm" onClick={() => {
										const last = shortDescriptions[shortDescriptions.length - 1];
										if (shortDescriptions.length > 0 && (!last || last.trim() === "")) {
											toast.error("Completa la frase actual antes de agregar otra");
											return;
										}
										setShortDescriptions([...shortDescriptions, ""]);
										toast.success("Frase agregada");
									}}>Agregar frase</Button>
								</div>
							</div>
							<div>
								<label className="block text-sm mb-1">Bio</label>
								<Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm mb-1">Ubicación</label>
									<Input value={location} onChange={(e) => setLocation(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Nivel de experiencia</label>
									<Input value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Años de experiencia</label>
									<Input type="number" value={yearsOfExperience as any} onChange={(e) => setYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))} />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Redes sociales</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">LinkedIn</label>
									<Input value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">GitHub</label>
									<Input value={gitHubUrl} onChange={(e) => setGitHubUrl(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Twitter</label>
									<Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Facebook</label>
									<Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
								</div>
								<div>
									<label className="block text-sm mb-1">Instagram</label>
									<Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Habilidades</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{skillCategories.map((c, i) => (
								<div key={i} className="rounded-md border p-3 space-y-2">
									<div>
										<label className="block text-xs mb-1">Categoría</label>
										<Input value={c.category} onChange={(e) => { const n=[...skillCategories]; n[i] = { ...n[i], category: e.target.value }; setSkillCategories(n); }} />
									</div>
									<div>
										<label className="block text-xs mb-1">Habilidades (separadas por coma)</label>
										<Input value={c.skillsText} onChange={(e) => { const n=[...skillCategories]; n[i] = { ...n[i], skillsText: e.target.value }; setSkillCategories(n); }} />
									</div>
									<div className="flex justify-end">
										<Button type="button" variant="ghost" size="sm" onClick={() => setSkillCategories(skillCategories.filter((_, idx) => idx !== i))}>Eliminar</Button>
									</div>
								</div>
							))}
							<div className="flex justify-end">
								<Button type="button" variant="outline" size="sm" onClick={() => {
									const last = skillCategories[skillCategories.length - 1];
									const lastIsEmpty = last && (!last.category?.trim() && !last.skillsText?.trim());
									if (skillCategories.length > 0 && lastIsEmpty) {
										toast.error("Completa la categoría actual antes de agregar otra");
										return;
									}
									setSkillCategories([...skillCategories, { category: "", skillsText: "" }]);
									toast.success("Categoría agregada");
								}}>Agregar categoría</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Experiencias</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{experiences.map((ex, i) => (
								<div key={i} className="rounded-md border p-3 space-y-2">
									<Input placeholder="Empresa" value={ex.company} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], company:e.target.value}; setExperiences(n); }} />
									<Input placeholder="Puesto" value={ex.position} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], position:e.target.value}; setExperiences(n); }} />
									<Input placeholder="Periodo" value={ex.period} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], period:e.target.value}; setExperiences(n); }} />
									<Input placeholder="Ubicación" value={ex.location} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], location:e.target.value}; setExperiences(n); }} />
									<Textarea rows={3} placeholder="Descripción" value={ex.description} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], description:e.target.value}; setExperiences(n); }} />
									<Input placeholder="Logros (separados por coma)" value={ex.achievementsText} onChange={(e) => { const n=[...experiences]; n[i]={...n[i], achievementsText:e.target.value}; setExperiences(n); }} />
									<div className="flex justify-end">
										<Button type="button" variant="ghost" size="sm" onClick={() => setExperiences(experiences.filter((_, idx) => idx !== i))}>Eliminar</Button>
									</div>
								</div>
							))}
							<div className="flex justify-end">
								<Button type="button" variant="outline" size="sm" onClick={() => {
									const last = experiences[experiences.length - 1];
									const invalid = last && (!last.company?.trim() || !last.position?.trim());
									if (experiences.length > 0 && invalid) {
										toast.error("Completa Empresa y Puesto antes de agregar otra experiencia");
										return;
									}
									setExperiences([...experiences, { company: "", position: "", period: "", location: "", description: "", achievementsText: "" }]);
									toast.success("Experiencia agregada");
								}}>Agregar experiencia</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Educación</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{educations.map((ed, i) => (
								<div key={i} className="rounded-md border p-3 space-y-2">
									<Input placeholder="Institución" value={ed.institution} onChange={(e) => { const n=[...educations]; n[i]={...n[i], institution:e.target.value}; setEducations(n); }} />
									<Input placeholder="Grado" value={ed.degree} onChange={(e) => { const n=[...educations]; n[i]={...n[i], degree:e.target.value}; setEducations(n); }} />
									<Input placeholder="Periodo" value={ed.period} onChange={(e) => { const n=[...educations]; n[i]={...n[i], period:e.target.value}; setEducations(n); }} />
									<Textarea rows={2} placeholder="Descripción" value={ed.description} onChange={(e) => { const n=[...educations]; n[i]={...n[i], description:e.target.value}; setEducations(n); }} />
									<div className="flex justify-end">
										<Button type="button" variant="ghost" size="sm" onClick={() => setEducations(educations.filter((_, idx) => idx !== i))}>Eliminar</Button>
									</div>
								</div>
							))}
							<div className="flex justify-end">
								<Button type="button" variant="outline" size="sm" onClick={() => {
									const last = educations[educations.length - 1];
									const invalid = last && (!last.institution?.trim());
									if (educations.length > 0 && invalid) {
										toast.error("Completa la institución antes de agregar otra educación");
										return;
									}
									setEducations([...educations, { institution: "", degree: "", period: "", description: "" }]);
									toast.success("Educación agregada");
								}}>Agregar educación</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Certificaciones</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{certifications.map((c, i) => (
								<div key={i} className="rounded-md border p-3 space-y-2">
									<Input placeholder="Nombre" value={c.name} onChange={(e) => { const n=[...certifications]; n[i]={...n[i], name:e.target.value}; setCertifications(n); }} />
									<Input placeholder="Entidad emisora" value={c.issuer} onChange={(e) => { const n=[...certifications]; n[i]={...n[i], issuer:e.target.value}; setCertifications(n); }} />
									<Input type="date" value={c.date} onChange={(e) => { const n=[...certifications]; n[i]={...n[i], date:e.target.value}; setCertifications(n); }} />
									<div className="flex justify-end">
										<Button type="button" variant="ghost" size="sm" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}>Eliminar</Button>
									</div>
								</div>
							))}
							<div className="flex justify-end">
								<Button type="button" variant="outline" size="sm" onClick={() => {
									const last = certifications[certifications.length - 1];
									const invalid = last && (!last.name?.trim());
									if (certifications.length > 0 && invalid) {
										toast.error("Completa el nombre antes de agregar otra certificación");
										return;
									}
									setCertifications([...certifications, { name: "", issuer: "", date: "" }]);
									toast.success("Certificación agregada");
								}}>Agregar certificación</Button>
							</div>
						</CardContent>
					</Card>

					{!isNew && (
						<Card>
							<CardHeader>
								<CardTitle>Cambiar contraseña</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<div>
										<label className="block text-sm mb-1">Contraseña actual</label>
										<Input type="password" value={currPw} onChange={(e) => setCurrPw(e.target.value)} />
									</div>
									<div>
										<label className="block text-sm mb-1">Nueva contraseña</label>
										<Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
									</div>
									<div>
										<label className="block text-sm mb-1">Confirmar nueva</label>
										<Input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} />
									</div>
								</div>
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>Por seguridad requiere la contraseña actual.</span>
								</div>
								<div className="flex justify-end">
									<Button type="button" disabled={changingPw} onClick={async () => {
										// Validaciones básicas
										if (!currPw || currPw.trim().length < 4) {
											toast.error("Contraseña actual inválida");
											return;
										}
										if (!newPw || newPw.trim().length < 8) {
											toast.error("La nueva contraseña debe tener al menos 8 caracteres");
											return;
										}
										if (newPw !== newPw2) {
											toast.error("Las contraseñas no coinciden");
											return;
										}
										setChangingPw(true);
										try {
											const userId = Number(params.id);
											await changePassword({ userId, currentPassword: currPw, newPassword: newPw });
											toast.success("Contraseña actualizada correctamente");
											setCurrPw(""); setNewPw(""); setNewPw2("");
										} catch (err) {
											const msg = err instanceof Error ? err.message : "No se pudo cambiar la contraseña";
											toast.error(msg);
										} finally {
											setChangingPw(false);
										}
									}}>{changingPw ? "Actualizando…" : "Actualizar contraseña"}</Button>
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Imagen de perfil</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{avatarUrl && (
								<div className="flex items-center gap-3">
									<img src={avatarUrl} alt="Previsualización" className="h-24 w-24 rounded-md object-cover border" />
									<div className="text-xs text-muted-foreground">Previsualización de la imagen actual/seleccionada</div>
								</div>
							)}
							<Input type="file" accept="image/*" onChange={(e) => {
								const f = e.target.files?.[0] || null;
								setImageFile(f);
								if (f) {
									const url = URL.createObjectURL(f);
									// Limpia el anterior preview si existía
									if (imagePreview && imagePreview.startsWith("blob:")) {
										try { URL.revokeObjectURL(imagePreview); } catch {}
									}
									setImagePreview(url);
								} else {
									// No hay archivo nuevo: conserva la imagen existente
									if (imagePreview && imagePreview.startsWith("blob:")) {
										try { URL.revokeObjectURL(imagePreview); } catch {}
									}
									setImagePreview(null);
								}
							}} />
						</CardContent>
					</Card>

					{error && <p className="text-red-500 text-sm">{error}</p>}
					<div className="flex gap-2 md:hidden">
						<Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
						<Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
					</div>
				</form>
		);
}

