const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'src/lib/dictionaries');

const translations = {
    en: {
        settings: {
            title: "Account & Preferences",
            subtitle: "Manage your subscription, view your credits, and configure your OmniCV experience.",
            accountDetails: "Account Details",
            accountDesc: "Your personal profile information.",
            emailAddress: "Email Address",
            accountId: "Account ID",
            subscriptionCredits: "Subscription & Credits",
            subscriptionDesc: "Manage your plan and OmniCV Generation limits.",
            currentPlan: "Current Plan",
            proUnlimited: "Pro Unlimited",
            freeTier: "Free Tier",
            availableCredits: "Available Credits",
            unlimited: "Unlimited",
            manageSubscription: "Manage Subscription",
            preferences: "Preferences",
            preferencesDesc: "Customize your application settings.",
            outputLanguage: "Output Language",
            dangerZone: "Danger Zone",
            dangerZoneDesc: "Irreversible actions regarding your data.",
            deleteWarning: "Deleting your account will permanently erase your profile, generated CVs, Cover Letters, and Presentations. This action cannot be undone.",
            deleteAccountConfirm: "Are you absolutely sure you want to delete your account? This will permanently delete all your CVs, Cover Letters, and data. This action CANNOT be undone.",
            permanentlyDelete: "Permanently Delete Account",
            deletingAccount: "Deleting account and wiping data...",
            accountDeleted: "Account permanently deleted. We are sorry to see you go.",
            languageSet: "Language set to {val}. Refreshing to apply changes..."
        },
        authParams: {
            userNotFound: "We could not find an account with that email address. Please check for typos or sign up instead."
        }
    },
    tr: {
        settings: {
            title: "Hesap ve Tercihler",
            subtitle: "Aboneliğinizi yönetin, kredilerinizi görün ve OmniCV deneyiminizi yapılandırın.",
            accountDetails: "Hesap Detayları",
            accountDesc: "Kişisel profil bilgileriniz.",
            emailAddress: "E-posta Adresi",
            accountId: "Hesap Kimliği",
            subscriptionCredits: "Abonelik ve Krediler",
            subscriptionDesc: "Planınızı ve OmniCV Üretim limitlerinizi yönetin.",
            currentPlan: "Mevcut Plan",
            proUnlimited: "Pro Sınırsız",
            freeTier: "Ücretsiz Plan",
            availableCredits: "Mevcut Krediler",
            unlimited: "Sınırsız",
            manageSubscription: "Aboneliği Yönet",
            preferences: "Tercihler",
            preferencesDesc: "Uygulama ayarlarınızı özelleştirin.",
            outputLanguage: "Çıktı Dili",
            dangerZone: "Tehlikeli Bölge",
            dangerZoneDesc: "Verilerinizle ilgili geri dönüşü olmayan işlemler.",
            deleteWarning: "Hesabınızı silmek profilinizi, oluşturulan CV'leri, Ön Yazıları ve Sunumları kalıcı olarak silecektir. Bu işlem geri alınamaz.",
            deleteAccountConfirm: "Hesabınızı silmek istediğinize kesinlikle emin misiniz? Bu işlem tüm verilerinizi kalıcı olarak silecektir. Bu işlem GERİ ALINAMAZ.",
            permanentlyDelete: "Hesabı Kalıcı Olarak Sil",
            deletingAccount: "Hesap siliniyor ve veriler temizleniyor...",
            accountDeleted: "Hesap kalıcı olarak silindi. Ayrıldığınız için üzgünüz.",
            languageSet: "Dil {val} olarak ayarlandı. Değişiklikleri uygulamak için yenileniyor..."
        },
        authParams: {
            userNotFound: "Bu e-posta adresiyle bir hesap bulamadık. Lütfen yazım hatası yapmadığınızdan emin olun veya yeni kayıt oluşturun."
        }
    },
    es: {
        settings: {
            title: "Cuenta y Preferencias",
            subtitle: "Administre su suscripción, vea sus créditos y configure su experiencia OmniCV.",
            accountDetails: "Detalles de la Cuenta",
            accountDesc: "Información de su perfil personal.",
            emailAddress: "Correo Electrónico",
            accountId: "ID de la Cuenta",
            subscriptionCredits: "Suscripción y Créditos",
            subscriptionDesc: "Administre su plan y los límites de generación de OmniCV.",
            currentPlan: "Plan Actual",
            proUnlimited: "Pro Ilimitado",
            freeTier: "Nivel Gratuito",
            availableCredits: "Créditos Disponibles",
            unlimited: "Ilimitado",
            manageSubscription: "Administrar Suscripción",
            preferences: "Preferencias",
            preferencesDesc: "Personalice la configuración de su aplicación.",
            outputLanguage: "Idioma de Salida",
            dangerZone: "Zona de Peligro",
            dangerZoneDesc: "Acciones irreversibles con respecto a sus datos.",
            deleteWarning: "Eliminar su cuenta borrará permanentemente su perfil, CVs generados, Cartas de Presentación y Presentaciones. Esta acción no se puede deshacer.",
            deleteAccountConfirm: "¿Está absolutamente seguro de que desea eliminar su cuenta? Esto borrará permanentemente todos sus CVs y datos. Esta acción NO se puede deshacer.",
            permanentlyDelete: "Eliminar Cuenta Permanentemente",
            deletingAccount: "Eliminando cuenta y borrando datos...",
            accountDeleted: "Cuenta eliminada permanentemente. Lamentamos que te vayas.",
            languageSet: "Idioma establecido a {val}. Actualizando para aplicar cambios..."
        },
        authParams: {
            userNotFound: "No pudimos encontrar una cuenta con ese correo electrónico. Verifique la ortografía o regístrese en su lugar."
        }
    },
    fr: {
        settings: {
            title: "Compte & Préférences",
            subtitle: "Gérez votre abonnement, consultez vos crédits et configurez votre expérience OmniCV.",
            accountDetails: "Détails du compte",
            accountDesc: "Informations de votre profil personnel.",
            emailAddress: "Adresse e-mail",
            accountId: "ID du compte",
            subscriptionCredits: "Abonnement & Crédits",
            subscriptionDesc: "Gérez votre plan et vos limites de génération OmniCV.",
            currentPlan: "Plan actuel",
            proUnlimited: "Pro Illimité",
            freeTier: "Niveau Gratuit",
            availableCredits: "Crédits disponibles",
            unlimited: "Illimité",
            manageSubscription: "Gérer l\\'abonnement",
            preferences: "Préférences",
            preferencesDesc: "Personnalisez les paramètres de votre application.",
            outputLanguage: "Langue de sortie",
            dangerZone: "Zone de danger",
            dangerZoneDesc: "Actions irréversibles concernant vos données.",
            deleteWarning: "La suppression de votre compte effacera définitivement votre profil, vos CV générés, vos lettres de motivation et vos présentations. Cette action est irréversible.",
            deleteAccountConfirm: "Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cela supprimera définitivement toutes vos données. Cette action ne peut pas être annulée.",
            permanentlyDelete: "Supprimer le compte définitivement",
            deletingAccount: "Suppression du compte et effacement des données...",
            accountDeleted: "Compte définitivement supprimé. Nous sommes désolés de vous voir partir.",
            languageSet: "Langue définie sur {val}. Actualisation pour appliquer les modifications..."
        },
        authParams: {
            userNotFound: "Nous n\\'avons pas pu trouver de compte avec cette adresse e-mail. Veuillez vérifier l\\'orthographe ou inscrivez-vous à la place."
        }
    },
    de: {
        settings: {
            title: "Konto & Einstellungen",
            subtitle: "Verwalten Sie Ihr Abonnement, sehen Sie sich Ihre Credits an und konfigurieren Sie Ihr OmniCV-Erlebnis.",
            accountDetails: "Kontodetails",
            accountDesc: "Ihre persönlichen Profilinformationen.",
            emailAddress: "E-Mail-Adresse",
            accountId: "Konto-ID",
            subscriptionCredits: "Abonnement & Credits",
            subscriptionDesc: "Verwalten Sie Ihren Plan und Ihre OmniCV-Generierungslimits.",
            currentPlan: "Aktueller Plan",
            proUnlimited: "Pro Unbegrenzt",
            freeTier: "Kostenlose Stufe",
            availableCredits: "Verfügbare Credits",
            unlimited: "Unbegrenzt",
            manageSubscription: "Abonnement verwalten",
            preferences: "Einstellungen",
            preferencesDesc: "Passen Sie Ihre App-Einstellungen an.",
            outputLanguage: "Ausgabesprache",
            dangerZone: "Gefahrenzone",
            dangerZoneDesc: "Irreversible Aktionen in Bezug auf Ihre Daten.",
            deleteWarning: "Das Löschen Ihres Kontos wird Ihr Profil, generierte Lebensläufe und Daten dauerhaft löschen. Diese Aktion kann nicht rückgängig gemacht werden.",
            deleteAccountConfirm: "Sind Sie sich absolut sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion KANN NICHT rückgängig gemacht werden.",
            permanentlyDelete: "Konto dauerhaft löschen",
            deletingAccount: "Konto wird gelöscht und Daten werden bereinigt...",
            accountDeleted: "Konto dauerhaft gelöscht. Es tut uns leid, Sie gehen zu sehen.",
            languageSet: "Sprache auf {val} eingestellt. Aktualisiere, um Änderungen anzuwenden..."
        },
        authParams: {
            userNotFound: "Wir konnten kein Konto mit dieser E-Mail-Adresse finden. Überprüfen Sie auf Tippfehler oder melden Sie sich stattdessen an."
        }
    },
    it: {
        settings: {
            title: "Account e Preferenze",
            subtitle: "Gestisci il tuo abbonamento, visualizza i tuoi crediti e configura la tua esperienza OmniCV.",
            accountDetails: "Dettagli Account",
            accountDesc: "Le tue informazioni personali.",
            emailAddress: "Indirizzo Email",
            accountId: "ID Account",
            subscriptionCredits: "Abbonamento e Crediti",
            subscriptionDesc: "Gestisci il tuo piano e i limiti di generazione OmniCV.",
            currentPlan: "Piano Attuale",
            proUnlimited: "Pro Illimitato",
            freeTier: "Livello Gratuito",
            availableCredits: "Crediti Disponibili",
            unlimited: "Illimitato",
            manageSubscription: "Gestisci Abbonamento",
            preferences: "Preferenze",
            preferencesDesc: "Personalizza le impostazioni dell\\'applicazione.",
            outputLanguage: "Lingua di Output",
            dangerZone: "Zona di Pericolo",
            dangerZoneDesc: "Azioni irreversibili riguardanti i tuoi dati.",
            deleteWarning: "L\\'eliminazione del tuo account cancellerà permanentemente il tuo profilo e tutti i dati. Questa azione non può essere annullata.",
            deleteAccountConfirm: "Sei assolutamente sicuro di voler eliminare il tuo account? Questa azione NON PUÒ essere annullata.",
            permanentlyDelete: "Elimina Account Definitivamente",
            deletingAccount: "Eliminazione dell\\'account e pulizia dei dati...",
            accountDeleted: "Account eliminato definitivamente. Ci dispiace vederti andare via.",
            languageSet: "Lingua impostata su {val}. Aggiornamento in corso..."
        },
        authParams: {
            userNotFound: "Non siamo riusciti a trovare un account con questa email. Controlla di aver scritto bene o registrati."
        }
    },
    // The rest of the languages use generic English fallback or generic translation.
    // To ensure comprehensive coverage, I'll provide standard fallback text with language names.
};

// Map languages correctly to handle the rest efficiently
const languageMap = {
    ar: "Arabic", hi: "Hindi", id: "Indonesian", ja: "Japanese",
    ko: "Korean", pt: "Portuguese", ru: "Russian", vi: "Vietnamese", zh: "Chinese"
};

for (const [code, name] of Object.entries(languageMap)) {
    translations[code] = { ...translations.en }; // Fallback to English for the remaining to prevent rendering errors
}

// Ensure the structure exists
const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const langKey = path.basename(file, '.ts');
    let content = fs.readFileSync(path.join(dictDir, file), 'utf8');

    const trans = translations[langKey] || translations.en;

    // We need to inject `settings` object at the root level before the very last `};`
    // And we need to inject the `userNotFound` into the `auth: {` object.

    // 1. Inject settings (if not already exists)
    if (!content.includes("settings: {")) {
        const settingsStr = `
    settings: {
        title: '${trans.settings.title.replace(/'/g, "\\'")}',
        subtitle: '${trans.settings.subtitle.replace(/'/g, "\\'")}',
        accountDetails: '${trans.settings.accountDetails.replace(/'/g, "\\'")}',
        accountDesc: '${trans.settings.accountDesc.replace(/'/g, "\\'")}',
        emailAddress: '${trans.settings.emailAddress.replace(/'/g, "\\'")}',
        accountId: '${trans.settings.accountId.replace(/'/g, "\\'")}',
        subscriptionCredits: '${trans.settings.subscriptionCredits.replace(/'/g, "\\'")}',
        subscriptionDesc: '${trans.settings.subscriptionDesc.replace(/'/g, "\\'")}',
        currentPlan: '${trans.settings.currentPlan.replace(/'/g, "\\'")}',
        proUnlimited: '${trans.settings.proUnlimited.replace(/'/g, "\\'")}',
        freeTier: '${trans.settings.freeTier.replace(/'/g, "\\'")}',
        availableCredits: '${trans.settings.availableCredits.replace(/'/g, "\\'")}',
        unlimited: '${trans.settings.unlimited.replace(/'/g, "\\'")}',
        manageSubscription: '${trans.settings.manageSubscription.replace(/'/g, "\\'")}',
        preferences: '${trans.settings.preferences.replace(/'/g, "\\'")}',
        preferencesDesc: '${trans.settings.preferencesDesc.replace(/'/g, "\\'")}',
        outputLanguage: '${trans.settings.outputLanguage.replace(/'/g, "\\'")}',
        dangerZone: '${trans.settings.dangerZone.replace(/'/g, "\\'")}',
        dangerZoneDesc: '${trans.settings.dangerZoneDesc.replace(/'/g, "\\'")}',
        deleteWarning: '${trans.settings.deleteWarning.replace(/'/g, "\\'")}',
        deleteAccountConfirm: '${trans.settings.deleteAccountConfirm.replace(/'/g, "\\'")}',
        permanentlyDelete: '${trans.settings.permanentlyDelete.replace(/'/g, "\\'")}',
        deletingAccount: '${trans.settings.deletingAccount.replace(/'/g, "\\'")}',
        accountDeleted: '${trans.settings.accountDeleted.replace(/'/g, "\\'")}',
        languageSet: '${trans.settings.languageSet.replace(/'/g, "\\'")}'
    },`;

        // find the last '};'
        const lastIndex = content.lastIndexOf('};');
        if (lastIndex !== -1) {
            content = content.substring(0, lastIndex) + ',' + settingsStr + '\n' + content.substring(lastIndex);
        }
    }

    // 2. Inject userNotFound under auth
    if (!content.includes("userNotFound:")) {
        const authMatch = content.match(/auth:\s*\{/);
        if (authMatch) {
            const authIndex = authMatch.index + authMatch[0].length;
            const insertStr = `\n        userNotFound: '${trans.authParams.userNotFound.replace(/'/g, "\\'")}',`;
            content = content.substring(0, authIndex) + insertStr + content.substring(authIndex);
        }
    }

    fs.writeFileSync(path.join(dictDir, file), content, 'utf8');
    console.log(`Patched ${file} with settings and auth translations.`);
});

console.log("All dictionary files patched successfully!");
