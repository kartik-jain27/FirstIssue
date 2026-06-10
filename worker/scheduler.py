import logging

from apscheduler.schedulers.blocking import BlockingScheduler

from fetch_issues import fetch_and_store_issues

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def run_scheduled_fetch():
    try:
        fetch_and_store_issues()
    except Exception:
        logger.exception("Scheduled GitHub issue fetch failed")


if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone="UTC")
    scheduler.add_job(run_scheduled_fetch, "interval", minutes=45, next_run_time=None)
    logger.info("Scheduler started. Fetch job will run every 45 minutes.")
    scheduler.start()
