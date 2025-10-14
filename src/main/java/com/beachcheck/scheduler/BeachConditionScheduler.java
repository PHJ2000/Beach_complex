package com.beachcheck.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BeachConditionScheduler {

    private static final Logger log = LoggerFactory.getLogger(BeachConditionScheduler.class);

    @Scheduled(cron = "0 0/30 * * * *")
    public void refreshConditions() {
        log.info("Scheduled condition refresh triggered");
        // TODO: Invoke telemetry ingestion workflow once data pipeline endpoints are exposed.
    }
}
