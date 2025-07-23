import React from 'react';
import {
  ShieldCheck, Lock, User, AlertTriangle,
  Clock, RefreshCcw, Gavel, Send
} from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-200 rounded-md p-6 mb-10 shadow-sm">
    <div className="flex items-center mb-4">
      <div className="bg-blue-100 p-2 rounded-md mr-3">
        <Icon className="text-blue-900 w-5 h-5" />
      </div>
      <h2 className="text-lg font-semibold text-blue-900 font-serif">{title}</h2>
    </div>
    <div className="text-gray-800 text-justify leading-7 font-serif">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-900 text-white rounded-t-md px-6 py-5 shadow-md">
          <h1 className="text-3xl font-bold text-center tracking-wide font-serif">Aviso de Privacidad</h1>
        </div>

        <div className="bg-white rounded-b-md px-6 py-10 shadow border-t-4 border-blue-900">
          <p className="text-gray-800 mb-10 text-justify leading-relaxed font-serif">
            En cumplimiento con los artículos 15 y 16 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP),  
            <strong> Grupo de Inversiones, Ahorros y Seguros (GIAS)</strong>, con domicilio en Colonia Tahuizan, Calle San Luis, Huejutla de Reyes, Hidalgo, México,  
            y correo electrónico <strong>giashuejutla@gmail.com</strong>, es el responsable del tratamiento, uso y protección de los datos personales proporcionados por sus usuarios.
          </p>

          <Section icon={User} title="1. Datos personales que recabamos">
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número telefónico con clave nacional</li>
              <li>Dirección (estado, municipio, colonia)</li>
              <li>Identificación oficial (INE)</li>
              <li>Perfil de Facebook (opcional)</li>
              <li>Datos de pago (procesados exclusivamente por PayPal)</li>
            </ul>
          </Section>

          <Section icon={ShieldCheck} title="2. Finalidades del tratamiento de datos">
            <ul className="list-disc pl-6 space-y-1">
              <li>Identificación y verificación de identidad del usuario</li>
              <li>Registro en la plataforma y acceso a servicios</li>
              <li>Gestión de sistemas de ahorro rotativo (tandas)</li>
              <li>Envío de notificaciones sobre pagos o actividades</li>
              <li>Procesamiento de pagos por terceros autorizados</li>
              <li>Generación de estadísticas internas de uso</li>
            </ul>
          </Section>

          <Section icon={Lock} title="3. Medidas de seguridad">
            <ul className="list-disc pl-6 space-y-1">
              <li>Cifrado seguro de contraseñas</li>
              <li>Comunicación cifrada por HTTPS</li>
              <li>Control de acceso y niveles de permisos</li>
              <li>Base de datos con protección física y lógica</li>
              <li>Respaldo automático de información crítica</li>
            </ul>
          </Section>

          <Section icon={AlertTriangle} title="4. Ejercicio de derechos ARCO">
            <p>
              El titular de los datos personales tiene derecho de acceder, rectificar, cancelar u oponerse al uso de sus datos. Para ejercer estos derechos deberá enviar un correo electrónico a <strong>giashuejutla@gmail.com</strong> con:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre completo y correo registrado</li>
              <li>Tipo de derecho que desea ejercer</li>
              <li>Justificación o aclaración</li>
              <li>Documento de identificación oficial</li>
            </ul>
            <p className="mt-2">Se dará respuesta en un plazo no mayor a 20 días hábiles.</p>
          </Section>

          <Section icon={Send} title="5. Transferencia de datos personales">
            <p>
              Sus datos no serán transferidos a terceros sin su consentimiento, salvo en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Cuando sea requerido por ley</li>
              <li>Para el cumplimiento de obligaciones contractuales (ej. PayPal)</li>
            </ul>
            <p className="mt-2">No se venderán ni compartirán con fines comerciales.</p>
          </Section>

          <Section icon={Clock} title="6. Plazo de conservación y eliminación">
            <p>
              Los datos personales serán conservados durante la vigencia de la cuenta del usuario y hasta por 12 meses tras la última interacción. 
              Después serán eliminados de forma segura o anonimizados de forma irreversible.
            </p>
          </Section>

          <Section icon={RefreshCcw} title="7. Cambios al aviso de privacidad">
            <p>
              Nos reservamos el derecho de modificar este aviso en cualquier momento. Cualquier modificación será notificada mediante esta misma página o por medios electrónicos si el usuario está registrado.
            </p>
          </Section>

          <Section icon={Gavel} title="8. Fundamento legal">
            <p>
              Este aviso fue elaborado en conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 5 de julio de 2010), su Reglamento y demás disposiciones aplicables.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
