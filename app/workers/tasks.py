import time
from app.workers.celery_app import celery_app

@celery_app.task
def send_email_task(email: str, subject: str, message: str):
    # Simulate email sending process
    time.sleep(2)
    print(f"Mock: Delivered email to {email}")
    return True

@celery_app.task
def generate_report_task(tenant_id: int):
    # Simulate heavy reporting task
    time.sleep(5)
    print(f"Mock: Report complete for tenant {tenant_id}")
    return f"http://example.com/reports/tenant_{tenant_id}_report_{time.time()}.pdf"
