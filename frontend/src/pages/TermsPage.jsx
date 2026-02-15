export default function TermsPage() {
  return (
    <div className="page info-page" dir="rtl">
      <div className="info-shell">
        <header className="info-hero">
          <p className="section-subtitle">الشروط والأحكام</p>
          <h1>نرحب بك في منصتنا ونوضح لك أسس الاستخدام.</h1>
          <p className="subtitle">
            قراءة هذه البنود تساعدك على معرفة حقوقك وواجباتك عند استخدام متجرنا أو إتمام أي طلب.
          </p>
        </header>

        <section className="info-card">
          <h2>استخدام الموقع</h2>
          <p>
            يجب أن يكون استخدامك للمنصة قانونياً ويحترم حقوق الآخرين. قد يتم إيقاف الحسابات التي
            تخالف ذلك دون إشعار مسبق.
          </p>
        </section>

        <section className="info-grid">
          <article>
            <h3>الطلبات والدفع</h3>
            <p>
              يتم قبول الطلب بعد تأكيد الدفع واستلام رسالة إلكترونية. نحتفظ بالحق في رفض أو إلغاء
              أي طلب في حال عدم توفر المنتج أو وجود مشكلة في الدفع.
            </p>
          </article>
          <article>
            <h3>الشحن والمرتجعات</h3>
            <p>
              نعمل على توصيل الطلبات في المواعيد المحددة. يمكنك طلب الإرجاع خلال 7 أيام من
              الاستلام وفق سياسة الاستبدال المعلنة على الموقع.
            </p>
          </article>
        </section>

        <section className="info-card">
          <h2>المسؤولية</h2>
          <p>
            نبذل أقصى جهد لضمان دقة المحتوى واستمرارية الخدمة، ومع ذلك لا نضمن عدم حدوث انقطاع أو
            خطأ خارج عن إرادتنا. استخدام المنصة يتم على مسؤوليتك الشخصية.
          </p>
        </section>

        <section className="info-card">
          <h3>تواصل معنا</h3>
          <p>
            لأي استفسار بخصوص هذه البنود راسلنا على hamzasamer.naeem1@gmail.com وسيقوم فريقنا بالمتابعة معك.
          </p>
        </section>
      </div>
    </div>
  );
}
