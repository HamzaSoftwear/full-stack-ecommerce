export default function PrivacyPolicyPage() {
  return (
    <div className="page info-page" dir="rtl">
      <div className="info-shell">
        <header className="info-hero">
          <p className="section-subtitle">سياسة الخصوصية</p>
          <h1>خصوصيتك أولوية مستمرة.</h1>
          <p className="subtitle">
            نلتزم بحماية بياناتك الشخصية واستخدامها فقط بما يضمن تجربة تسوق آمنة وسلسة.
          </p>
        </header>

        <section className="info-card">
          <h2>المعلومات التي نجمعها</h2>
          <p>
            نجمع بيانات التسجيل الأساسية مثل الاسم والبريد الإلكتروني ورقم الجوال، إضافة إلى
            عناوين الشحن والدفع اللازمة لإتمام الطلبات.
          </p>
        </section>

        <section className="info-card">
          <h2>كيف نستخدم بياناتك؟</h2>
          <p>
            نستخدم المعلومات لتجهيز الطلبات، التواصل بشأن حالة الشحن، تحسين تجربة التصفح، وإرسال
            العروض التي تهمك بعد الحصول على موافقتك.
          </p>
        </section>

        <section className="info-card">
          <h2>الكوكيز والتتبع</h2>
          <p>
            نلجأ إلى ملفات تعريف الارتباط لتحسين أداء الموقع وتذكّر تفضيلاتك. يمكنك تعديل إعدادات
            المتصفح لتعطيلها متى شئت.
          </p>
        </section>

        <section className="info-card">
          <h3>تواصل معنا</h3>
          <p>
            لأي استفسار يتعلق بالخصوصية يمكنك مراسلتنا على privacy@store.com وسنرد خلال يومي عمل.
          </p>
        </section>
      </div>
    </div>
  );
}
