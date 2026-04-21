export type Language = 'es' | 'ayuujk';

export interface Translations {
  nav: {
    home: string;
    team: string;
    contact: string;
    login: string;
    logout: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    cta: string;
    liveNow: string;
    statusActive: string;
    statusComingSoon: string;
    adminPanel: string;
    by: string;
    like: string;
    comment: string;
    share: string;
    metaTitle: string;
    metaDesc: string;
    publishError: string;
  };
  team: {
    title: string;
    subtitle: string;
    addMember: string;
    editMember: string;
    deleteMember: string;
    peopleOfClouds: string;
    loading: string;
    defaultBio: string;
    missionTitle: string;
    missionDesc: string;
    editModalTitle: string;
    newModalTitle: string;
    fullName: string;
    namePlaceholder: string;
    role: string;
    selectRole: string;
    email: string;
    emailPlaceholder: string;
    shortBio: string;
    bioPlaceholder: string;
    profilePhoto: string;
    photoUrlPlaceholder: string;
    photoDesc: string;
    cancel: string;
    save: string;
    confirmDelete: string;
  };
  view: {
    title: string;
    availableStreams: string;
    selectToWatch: string;
    live: string;
    viewers: string;
    shareFacebook: string;
    streamEnded: string;
    waitingStream: string;
    connecting: string;
    videoInvitation: string;
    invitationDesc: string;
    reject: string;
    accept: string;
    privateCallActive: string;
    flipCamera: string;
    you: string;
    streamEndedDesc: string;
    waitingResume: string;
    waitingStartDesc: string;
    connectedToServer: string;
    connectingDesc: string;
    retryConnection: string;
  };
  recordings: {
    title: string;
    uploadVideo: string;
    history: string;
    loading: string;
    noRecordings: string;
    goToAdmin: string;
    selectVideo: string;
    recordedOn: string;
    buyVideo: string;
    download: string;
    delete: string;
    confirmDelete: string;
    errorSaving: string;
    errorLoading: string;
    selectVideoDesc: string;
  };
  adminNews: {
    loginTitle: string;
    loginSubtitle: string;
    passwordPlaceholder: string;
    enter: string;
    backHome: string;
    panelTitle: string;
    newsTab: string;
    videosTab: string;
    logout: string;
    newNews: string;
    newsTitle: string;
    newsAuthor: string;
    newsContent: string;
    publishNews: string;
    publishedNews: string;
    noNews: string;
    newVideo: string;
    videoTitle: string;
    videoAuthor: string;
    videoThumbnail: string;
    videoPrice: string;
    videoUrl: string;
    publishVideo: string;
    communityVideos: string;
    noVideos: string;
    confirmDeleteNews: string;
    confirmDeleteVideo: string;
    wrongPassword: string;
    errorPublishingNews: string;
    errorPublishingVideo: string;
    errorDeleting: string;
    urlPlaceholder: string;
    pricePlaceholder: string;
    loginHelmet: string;
    panelHelmet: string;
  };
  broadcast: {
    title: string;
    live: string;
    viewers: string;
    uptime: string;
    share: string;
    copied: string;
    startStream: string;
    stopStream: string;
    startRecording: string;
    stopRecording: string;
    recordingSaved: string;
    users: string;
    chat: string;
    privateCall: string;
    endCall: string;
    inviteToCall: string;
    cameraError: string;
    socketError: string;
    flipCamera: string;
  };
  news: {
    title: string;
    subtitle: string;
    publishNews: string;
    closeForm: string;
    newPost: string;
    newsTitle: string;
    newsContent: string;
    imageLabel: string;
    uploadFile: string;
    imageSelected: string;
    pasteUrl: string;
    videoUrl: string;
    adminPassword: string;
    publishNow: string;
    readMore: string;
    noNews: string;
    facebookTitle: string;
    facebookSubtitle: string;
    followFacebook: string;
    footerCopyright: string;
    footerMadeWith: string;
    memoryTitle: string;
    exploreArchive: string;
    location: string;
    locationName: string;
    musiciansTitle: string;
    musiciansSubtitle: string;
    musiciansDesc: string;
    mixeSymphony: string;
    mixeSymphonyDesc: string;
    sacredAltitude: string;
    sacredAltitudeDesc: string;
  };
  community: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    uploadMedia: string;
    noMedia: string;
    postTitle: string;
    postDesc: string;
    postTags: string;
    postType: string;
    image: string;
    video: string;
    publish: string;
    publishing: string;
    comments: string;
    addComment: string;
    postComment: string;
  };
  contacts: {
    title: string;
    suggestions: string;
    addContact: string;
    pending: string;
    accepted: string;
    noContacts: string;
    searchUsers: string;
  };
  videoCall: {
    startCall: string;
    incomingCall: string;
    connecting: string;
    endCall: string;
    mic: string;
    camera: string;
    groups: string;
    newGroup: string;
    groupName: string;
    members: string;
    createGroup: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      home: 'Inicio',
      team: 'Equipo',
      contact: 'Contacto',
      login: 'Acceso',
      logout: 'Salir',
    },
    home: {
      heroTitle: 'La Voz de la Cultura Mixe',
      heroSubtitle: 'Transmitiendo la esencia de nuestras raíces, lengua y tradiciones para el mundo entero.',
      cta: 'Ver Programación',
      liveNow: 'En Vivo',
      statusActive: 'Transmisión Activa',
      statusComingSoon: 'Próximamente',
      adminPanel: 'Panel Admin',
      by: 'Por',
      like: 'Me gusta',
      comment: 'Comentar',
      share: 'Compartir',
      metaTitle: 'Vida Mixe TV | Inicio - La Región de los Jamás Conquistados',
      metaDesc: 'Conectando a la comunidad Ayuuk con el mundo. Transmisiones en vivo desde el corazón de la sierra de Oaxaca.',
      publishError: 'Error al publicar',
    },
    team: {
      title: 'Nuestro Equipo',
      subtitle: 'Las personas que hacen posible Vida Mixe TV.',
      addMember: 'Agregar Miembro',
      editMember: 'Editar',
      deleteMember: 'Eliminar',
      peopleOfClouds: 'Gente de las Nubes',
      loading: 'Cargando equipo...',
      defaultBio: 'Miembro del equipo de Vida Mixe TV.',
      missionTitle: 'Nuestra Misión',
      missionDesc: 'Fortalecer la identidad Ayuuk mediante el uso de herramientas tecnológicas modernas, creando un puente entre nuestra herencia ancestral y las nuevas generaciones, sin importar en qué parte del mundo se encuentren.',
      editModalTitle: 'Editar Miembro',
      newModalTitle: 'Nuevo Miembro',
      fullName: 'Nombre Completo',
      namePlaceholder: 'Ej. Juan Pérez',
      role: 'Rol / Puesto',
      selectRole: 'Seleccionar rol',
      email: 'Correo Electrónico',
      emailPlaceholder: 'correo@vidamixe.tv',
      shortBio: 'Biografía Corta',
      bioPlaceholder: 'Breve descripción del miembro...',
      profilePhoto: 'Foto de Perfil',
      photoUrlPlaceholder: 'O pega una URL de imagen...',
      photoDesc: 'Puedes subir un archivo o pegar un enlace directo.',
      cancel: 'Cancelar',
      save: 'Guardar',
      confirmDelete: '¿Estás seguro de eliminar a este miembro?',
    },
    view: {
      title: 'Ver Transmisión en Vivo',
      availableStreams: 'Transmisiones Disponibles',
      selectToWatch: 'Selecciona una transmisión para comenzar a ver',
      live: 'EN VIVO',
      viewers: 'espectadores',
      shareFacebook: 'Compartir en Facebook',
      streamEnded: 'Transmisión finalizada',
      waitingStream: 'Esperando transmisión',
      connecting: 'Conectando...',
      videoInvitation: 'Invitación a Video',
      invitationDesc: 'El anfitrión te está invitando a unirte a una videollamada privada.',
      reject: 'Rechazar',
      accept: 'Aceptar',
      privateCallActive: 'En llamada privada con el anfitrión',
      flipCamera: 'Voltear Cámara',
      you: 'Tú',
      streamEndedDesc: 'El transmisor ha finalizado el video en vivo o se ha perdido la conexión.',
      waitingResume: 'Esperando que se reanude...',
      waitingStartDesc: 'El transmisor aún no ha iniciado el video en vivo. La reproducción comenzará automáticamente.',
      connectedToServer: 'Conectado al servidor',
      connectingDesc: 'Estableciendo conexión con el servidor de transmisión.',
      retryConnection: 'Reintentar Conexión',
    },
    recordings: {
      title: 'Grabaciones Guardadas',
      uploadVideo: 'Subir Video',
      history: 'Historial',
      loading: 'Cargando...',
      noRecordings: 'No hay grabaciones guardadas.',
      goToAdmin: 'Ir a transmitir para grabar',
      selectVideo: 'Selecciona una grabación',
      recordedOn: 'Grabado el',
      buyVideo: 'Comprar video',
      download: 'Descargar',
      delete: 'Eliminar',
      confirmDelete: '¿Estás seguro de que deseas eliminar esta grabación?',
      errorSaving: 'Error al guardar el video.',
      errorLoading: 'No se pudo cargar el video. Asegúrate de que el formato sea compatible.',
      selectVideoDesc: 'Selecciona una grabación de la lista para reproducirla.',
    },
    adminNews: {
      loginTitle: 'Administración',
      loginSubtitle: 'Ingresa la contraseña para gestionar noticias',
      passwordPlaceholder: 'Contraseña',
      enter: 'Entrar',
      backHome: 'Volver al inicio',
      panelTitle: 'Panel de Administración',
      newsTab: 'Noticias',
      videosTab: 'Videos',
      logout: 'Cerrar Sesión',
      newNews: 'Nueva Noticia',
      newsTitle: 'Título',
      newsAuthor: 'Autor',
      newsContent: 'Contenido',
      publishNews: 'Publicar Noticia',
      publishedNews: 'Noticias Publicadas',
      noNews: 'No hay noticias publicadas aún.',
      newVideo: 'Nuevo Video',
      videoTitle: 'Título',
      videoAuthor: 'Autor',
      videoThumbnail: 'URL Miniatura',
      videoPrice: 'Precio',
      videoUrl: 'URL Video (MP4)',
      publishVideo: 'Publicar Video',
      communityVideos: 'Videos de la Comunidad',
      noVideos: 'No hay videos publicados aún.',
      confirmDeleteNews: '¿Estás seguro de eliminar esta noticia?',
      confirmDeleteVideo: '¿Estás seguro de eliminar este video?',
      wrongPassword: 'Contraseña incorrecta',
      errorPublishingNews: 'Error al publicar noticia',
      errorPublishingVideo: 'Error al publicar video',
      errorDeleting: 'Error al eliminar',
      urlPlaceholder: 'https://...',
      pricePlaceholder: '$100 MXN',
      loginHelmet: 'Admin Login | Vida Mixe TV',
      panelHelmet: 'Gestionar Noticias | Vida Mixe TV',
    },
    broadcast: {
      title: 'Panel de Transmisión',
      live: 'EN VIVO',
      viewers: 'espectadores',
      uptime: 'Tiempo al aire',
      share: 'Compartir enlace',
      copied: '¡Copiado!',
      startStream: 'Iniciar Transmisión',
      stopStream: 'Detener Transmisión',
      startRecording: 'Grabar',
      stopRecording: 'Detener Grabación',
      recordingSaved: 'Grabación guardada correctamente',
      users: 'Usuarios conectados',
      chat: 'Chat en vivo',
      privateCall: 'Llamada Privada',
      endCall: 'Finalizar Llamada',
      inviteToCall: 'Invitar a videollamada',
      cameraError: 'Error al acceder a la cámara',
      socketError: 'Error de conexión con el servidor',
      flipCamera: 'Voltear Cámara',
    },
    news: {
      title: 'Noticias de la Sierra',
      subtitle: 'Actualidad Ayuuk',
      publishNews: 'Publicar Noticia',
      closeForm: 'Cerrar Formulario',
      newPost: 'Nueva Publicación',
      newsTitle: 'Título de la noticia',
      newsContent: 'Contenido de la noticia...',
      imageLabel: 'Imagen (Archivo o URL)',
      uploadFile: 'Subir archivo',
      imageSelected: 'Imagen seleccionada',
      pasteUrl: 'O pega URL',
      videoUrl: 'URL de Video',
      adminPassword: 'Contraseña de administrador (mixe2024)',
      publishNow: 'Publicar Ahora',
      readMore: 'Leer más',
      noNews: 'No hay noticias en el horizonte',
      facebookTitle: 'Facebook Feed',
      facebookSubtitle: 'Redes Sociales',
      followFacebook: 'Seguir en Facebook',
      footerCopyright: 'Vida Mixe TV',
      footerMadeWith: 'Hecho con ❤️ en la Sierra Norte de Oaxaca',
      memoryTitle: 'Recuerdo Mixe',
      exploreArchive: 'Explorar Archivo',
      location: 'Ubicación',
      locationName: 'Sierra Norte, Oaxaca',
      musiciansTitle: 'Santa María',
      musiciansSubtitle: 'Tlahuitoltepec',
      musiciansDesc: 'El corazón palpitante de la cultura Ayuuk. Aquí, la música no es solo arte, es el lenguaje de la resistencia y la identidad. Hogar del CECAM, donde cada nota cuenta la historia de un pueblo que nunca fue conquistado.',
      mixeSymphony: 'Sinfonía Mixe',
      mixeSymphonyDesc: 'Bandas de viento que resuenan en las nubes.',
      sacredAltitude: 'Altitud Sagrada',
      sacredAltitudeDesc: 'Tradiciones preservadas en la cima de la sierra.',
    },
    community: {
      title: 'Comunidad Mixe',
      subtitle: 'Nuestras historias en fotos y videos',
      searchPlaceholder: 'Buscar por etiquetas o título...',
      uploadMedia: 'Publicar Foto/Video',
      noMedia: 'Aún no hay publicaciones. ¡Sé el primero!',
      postTitle: 'Título',
      postDesc: 'Descripción',
      postTags: 'Etiquetas (separadas por coma)',
      postType: 'Tipo de contenido',
      image: 'Imagen',
      video: 'Video',
      publish: 'Publicar',
      publishing: 'Publicando...',
      comments: 'Comentarios',
      addComment: 'Añadir un comentario...',
      postComment: 'Enviar',
    },
    contacts: {
      title: 'Mis Contactos',
      suggestions: 'Sugerencias',
      addContact: 'Agregar',
      pending: 'Pendiente',
      accepted: 'Conectados',
      noContacts: 'No tienes contactos aún. Busca a tus amigos.',
      searchUsers: 'Buscar usuarios...',
    },
    videoCall: {
      startCall: 'Iniciar Videollamada',
      incomingCall: 'Llamada Entrante',
      connecting: 'Conectando...',
      endCall: 'Finalizar',
      mic: 'Micrófono',
      camera: 'Cámara',
      groups: 'Grupos',
      newGroup: 'Nuevo Grupo',
      groupName: 'Nombre del Grupo',
      members: 'Miembros',
      createGroup: 'Crear Grupo',
    },
  },
  ayuujk: {
    nav: {
      home: 'Jëën',
      team: 'Tu\'u',
      contact: 'Contacto',
      login: 'Acceso',
      logout: 'Salir',
    },
    home: {
      heroTitle: 'Ayuujk Jä’äy tyu’u',
      heroSubtitle: 'Nëjkx muku’uk ja ayuujk, ja jä’äy yë’ë tyu’u ja’ay.',
      cta: 'Ixy ja programa',
      liveNow: 'En Vivo',
      statusActive: 'Transmisión Activa',
      statusComingSoon: 'Próximamente',
      adminPanel: 'Panel Admin',
      by: 'Por',
      like: 'Me gusta',
      comment: 'Comentar',
      share: 'Compartir',
      metaTitle: 'Vida Mixe TV | Inicio - La Región de los Jamás Conquistados',
      metaDesc: 'Conectando a la comunidad Ayuuk con el mundo. Transmisiones en vivo desde el corazón de la sierra de Oaxaca.',
      publishError: 'Error al publicar',
    },
    team: {
      title: 'Ja Tu\'u',
      subtitle: 'Ja jä\'äy yë\'ë Vida Mixe TV tyu\'u.',
      addMember: 'Mëjtë jä\'äy',
      editMember: 'Yë\'ëy',
      deleteMember: 'Pëjtst',
      peopleOfClouds: 'Gente de las Nubes',
      loading: 'Cargando equipo...',
      defaultBio: 'Miembro del equipo de Vida Mixe TV.',
      missionTitle: 'Nuestra Misión',
      missionDesc: 'Fortalecer la identidad Ayuuk mediante el uso de herramientas tecnológicas modernas, creando un puente entre nuestra herencia ancestral y las nuevas generaciones, sin importar en qué parte del mundo se encuentren.',
      editModalTitle: 'Editar Miembro',
      newModalTitle: 'Nuevo Miembro',
      fullName: 'Nombre Completo',
      namePlaceholder: 'Ej. Juan Pérez',
      role: 'Rol / Puesto',
      selectRole: 'Seleccionar rol',
      email: 'Correo Electrónico',
      emailPlaceholder: 'correo@vidamixe.tv',
      shortBio: 'Biografía Corta',
      bioPlaceholder: 'Breve descripción del miembro...',
      profilePhoto: 'Foto de Perfil',
      photoUrlPlaceholder: 'O pega una URL de imagen...',
      photoDesc: 'Puedes subir un archivo o pegar un enlace directo.',
      cancel: 'Cancelar',
      save: 'Guardar',
      confirmDelete: '¿Estás seguro de eliminar a este miembro?',
    },
    view: {
      title: 'Ixy ja Transmisión',
      availableStreams: 'Ja Transmisiones',
      selectToWatch: 'Ixy ja transmisión',
      live: 'EN VIVO',
      viewers: 'jä\'äy ixy',
      shareFacebook: 'Facebook',
      streamEnded: 'Yë\'ëy ja transmisión',
      waitingStream: 'Mëët ja transmisión',
      connecting: 'Nëjkx...',
      videoInvitation: 'Invitación a Video',
      invitationDesc: 'El anfitrión te está invitando a unirte a una videollamada privada.',
      reject: 'Rechazar',
      accept: 'Aceptar',
      privateCallActive: 'En llamada privada con el anfitrión',
      flipCamera: 'Voltear Cámara',
      you: 'Tú',
      streamEndedDesc: 'El transmisor ha finalizado el video en vivo o se ha perdido la conexión.',
      waitingResume: 'Esperando que se reanude...',
      waitingStartDesc: 'El transmisor aún no ha iniciado el video en vivo. La reproducción comenzará automáticamente.',
      connectedToServer: 'Conectado al servidor',
      connectingDesc: 'Estableciendo conexión con el servidor de transmisión.',
      retryConnection: 'Reintentar Conexión',
    },
    recordings: {
      title: 'Ja Grabaciones',
      uploadVideo: 'Mëjtë Video',
      history: 'Ja Historial',
      loading: 'Nëjkx...',
      noRecordings: 'Ka\'t ja grabaciones.',
      goToAdmin: 'Nëjkx ja transmisión',
      selectVideo: 'Ixy ja grabación',
      recordedOn: 'Yë\'ëy ja',
      buyVideo: 'Yë\'ëy video',
      download: 'Pëjtst',
      delete: 'Pëjtst',
      confirmDelete: '¿Estás seguro de que deseas eliminar esta grabación?',
      errorSaving: 'Error al guardar el video.',
      errorLoading: 'No se pudo cargar el video. Asegúrate de que el formato sea compatible.',
      selectVideoDesc: 'Selecciona una grabación de la lista para reproducirla.',
    },
    adminNews: {
      loginTitle: 'Administración',
      loginSubtitle: 'Ingresa la contraseña para gestionar noticias',
      passwordPlaceholder: 'Contraseña',
      enter: 'Entrar',
      backHome: 'Volver al inicio',
      panelTitle: 'Panel de Administración',
      newsTab: 'Noticias',
      videosTab: 'Videos',
      logout: 'Cerrar Sesión',
      newNews: 'Nueva Noticia',
      newsTitle: 'Título',
      newsAuthor: 'Autor',
      newsContent: 'Contenido',
      publishNews: 'Publicar Noticia',
      publishedNews: 'Noticias Publicadas',
      noNews: 'No hay noticias publicadas aún.',
      newVideo: 'Nuevo Video',
      videoTitle: 'Título',
      videoAuthor: 'Autor',
      videoThumbnail: 'URL Miniatura',
      videoPrice: 'Precio',
      videoUrl: 'URL Video (MP4)',
      publishVideo: 'Publicar Video',
      communityVideos: 'Videos de la Comunidad',
      noVideos: 'No hay videos publicados aún.',
      confirmDeleteNews: '¿Estás seguro de eliminar esta noticia?',
      confirmDeleteVideo: '¿Estás seguro de eliminar este video?',
      wrongPassword: 'Contraseña incorrecta',
      errorPublishingNews: 'Error al publicar noticia',
      errorPublishingVideo: 'Error al publicar video',
      errorDeleting: 'Error al eliminar',
      urlPlaceholder: 'https://...',
      pricePlaceholder: '$100 MXN',
      loginHelmet: 'Admin Login | Vida Mixe TV',
      panelHelmet: 'Gestionar Noticias | Vida Mixe TV',
    },
    broadcast: {
      title: 'Panel de Transmisión',
      live: 'EN VIVO',
      viewers: 'espectadores',
      uptime: 'Tiempo al aire',
      share: 'Compartir enlace',
      copied: '¡Copiado!',
      startStream: 'Iniciar Transmisión',
      stopStream: 'Detener Transmisión',
      startRecording: 'Grabar',
      stopRecording: 'Detener Grabación',
      recordingSaved: 'Grabación guardada correctamente',
      users: 'Usuarios conectados',
      chat: 'Chat en vivo',
      privateCall: 'Llamada Privada',
      endCall: 'Finalizar Llamada',
      inviteToCall: 'Invitar a videollamada',
      cameraError: 'Error al acceder a la cámara',
      socketError: 'Error de conexión con el servidor',
      flipCamera: 'Voltear Cámara',
    },
    news: {
      title: 'Noticias de la Sierra',
      subtitle: 'Actualidad Ayuuk',
      publishNews: 'Publicar Noticia',
      closeForm: 'Cerrar Formulario',
      newPost: 'Nueva Publicación',
      newsTitle: 'Título de la noticia',
      newsContent: 'Contenido de la noticia...',
      imageLabel: 'Imagen (Archivo o URL)',
      uploadFile: 'Subir archivo',
      imageSelected: 'Imagen seleccionada',
      pasteUrl: 'O pega URL',
      videoUrl: 'URL de Video',
      adminPassword: 'Contraseña de administrador (mixe2024)',
      publishNow: 'Publicar Ahora',
      readMore: 'Leer más',
      noNews: 'No hay noticias en el horizonte',
      facebookTitle: 'Facebook Feed',
      facebookSubtitle: 'Redes Sociales',
      followFacebook: 'Seguir en Facebook',
      footerCopyright: 'Vida Mixe TV',
      footerMadeWith: 'Hecho con ❤️ en la Sierra Norte de Oaxaca',
      memoryTitle: 'Recuerdo Mixe',
      exploreArchive: 'Explorar Archivo',
      location: 'Ubicación',
      locationName: 'Sierra Norte, Oaxaca',
      musiciansTitle: 'Santa María',
      musiciansSubtitle: 'Tlahuitoltepec',
      musiciansDesc: 'El corazón palpitante de la cultura Ayuuk. Aquí, la música no es solo arte, es el lenguaje de la resistencia y la identidad. Hogar del CECAM, donde cada nota cuenta la historia de un pueblo que nunca fue conquistado.',
      mixeSymphony: 'Sinfonía Mixe',
      mixeSymphonyDesc: 'Bandas de viento que resuenan en las nubes.',
      sacredAltitude: 'Altitud Sagrada',
      sacredAltitudeDesc: 'Tradiciones preservadas en la cima de la sierra.',
    },
    community: {
      title: 'Comunidad Mixe',
      subtitle: 'Nuestras historias en fotos y videos',
      searchPlaceholder: 'Buscar por etiquetas o título...',
      uploadMedia: 'Publicar Foto/Video',
      noMedia: 'Aún no hay publicaciones. ¡Sé el primero!',
      postTitle: 'Título',
      postDesc: 'Descripción',
      postTags: 'Etiquetas (separadas por coma)',
      postType: 'Tipo de contenido',
      image: 'Imagen',
      video: 'Video',
      publish: 'Publicar',
      publishing: 'Publicando...',
      comments: 'Comentarios',
      addComment: 'Añadir un comentario...',
      postComment: 'Enviar',
    },
    contacts: {
      title: 'Mis Contactos',
      suggestions: 'Sugerencias',
      addContact: 'Agregar',
      pending: 'Pendiente',
      accepted: 'Conectados',
      noContacts: 'No tienes contactos aún. Busca a tus amigos.',
      searchUsers: 'Buscar usuarios...',
    },
    videoCall: {
      startCall: 'Iniciar Videollamada',
      incomingCall: 'Llamada Entrante',
      connecting: 'Conectando...',
      endCall: 'Finalizar',
      mic: 'Micrófono',
      camera: 'Cámara',
      groups: 'Grupos',
      newGroup: 'Nuevo Grupo',
      groupName: 'Nombre del Grupo',
      members: 'Miembros',
      createGroup: 'Crear Grupo',
    },
  },
};
