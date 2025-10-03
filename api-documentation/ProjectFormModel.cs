using System.ComponentModel.DataAnnotations;

namespace WebApi.Models
{
    /// <summary>
    /// Modelo para el formulario de creación/actualización de proyectos
    /// </summary>
    public class ProjectFormModel
    {
        /// <summary>
        /// Título del proyecto
        /// </summary>
        /// <example>E-commerce Platform</example>
        [Required(ErrorMessage = "El título es obligatorio")]
        [StringLength(200, ErrorMessage = "El título no puede exceder 200 caracteres")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Descripción detallada del proyecto
        /// </summary>
        /// <example>Plataforma completa de comercio electrónico con carrito de compras, pagos y gestión de inventario.</example>
        [Required(ErrorMessage = "La descripción es obligatoria")]
        [StringLength(1000, ErrorMessage = "La descripción no puede exceder 1000 caracteres")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Tecnologías utilizadas (separadas por comas)
        /// </summary>
        /// <example>React,Node.js,MongoDB,Stripe</example>
        [StringLength(500, ErrorMessage = "Las tecnologías no pueden exceder 500 caracteres")]
        public string? Technologies { get; set; }

        /// <summary>
        /// URL de la demo del proyecto
        /// </summary>
        /// <example>https://mi-proyecto.vercel.app</example>
        [Url(ErrorMessage = "La URL de demo debe ser válida")]
        public string? DemoUrl { get; set; }

        /// <summary>
        /// URL del código fuente
        /// </summary>
        /// <example>https://github.com/usuario/proyecto</example>
        [Url(ErrorMessage = "La URL del código debe ser válida")]
        public string? CodeUrl { get; set; }

        /// <summary>
        /// Archivos de imagen del proyecto
        /// </summary>
        public IFormFile[]? Images { get; set; }

        /// <summary>
        /// Indica si el proyecto está destacado
        /// </summary>
        /// <example>true</example>
        public bool IsFeatured { get; set; } = false;

        /// <summary>
        /// Estado del proyecto
        /// </summary>
        /// <example>Completed</example>
        public ProjectStatus Status { get; set; } = ProjectStatus.InProgress;

        /// <summary>
        /// Categoría del proyecto
        /// </summary>
        /// <example>Web Development</example>
        [StringLength(100, ErrorMessage = "La categoría no puede exceder 100 caracteres")]
        public string? Category { get; set; }
    }

    /// <summary>
    /// Estados posibles de un proyecto
    /// </summary>
    public enum ProjectStatus
    {
        /// <summary>
        /// En progreso
        /// </summary>
        InProgress = 0,
        
        /// <summary>
        /// Completado
        /// </summary>
        Completed = 1,
        
        /// <summary>
        /// Pausado
        /// </summary>
        Paused = 2,
        
        /// <summary>
        /// Cancelado
        /// </summary>
        Cancelled = 3
    }
}