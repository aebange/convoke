package com.convoke.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${app.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${app.datasource.url}")
    private String url;

    @Value("${app.datasource.username}")
    private String username;

    @Value("${app.datasource.password}")
    private String password;

    @Value("${app.datasource.flyway-migrate-on-startup}")
    private boolean runFlywayMigrateOnStartup;

    // NOTE: If this is set to true then the database will get nuked on startup
    @Value("${app.datasource.flyway-clean-on-startup}")
    private boolean runFlywayCleanOnStartup;

    @Value("${app.datasource.maxPoolSize:10}")
    private int maxPoolSize;

    @Value("${app.datasource.schema}")
    private String schemaName;


    @Bean
    public DataSource dataSource() {
        logger.debug("dataSource() started");
        HikariConfig hikariConfig = new HikariConfig();

        hikariConfig.setDriverClassName(this.driverClassName);
        hikariConfig.setJdbcUrl(this.url);
        hikariConfig.setUsername(this.username);
        hikariConfig.setPassword(this.password);
        hikariConfig.setMaximumPoolSize(this.maxPoolSize);
        hikariConfig.setConnectionTestQuery("SELECT 1");
        hikariConfig.setPoolName("convoke_webapp_jdbc_connection_pool");
        hikariConfig.setSchema(this.schemaName);

        // Create the DataSource (and attempt to connect to it)
        HikariDataSource dataSource = new HikariDataSource(hikariConfig);

        if (runFlywayMigrateOnStartup) {
            // Initialize the flyway object by setting the data source and schema name
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .schemas(schemaName)
                    .load();

            if (runFlywayCleanOnStartup) {
                logger.debug("Running flyway clean on startup...");
                flyway.clean();
            }

            // Now that the db schema is clean, migrate it
            flyway.migrate();
            logger.debug("Flyway migrate finished successfully.");

        }

        logger.debug("JDBC Connection Pool has a size of {} connections", this.maxPoolSize);

        logger.debug("dataSource() finished successfully.");
        return dataSource;
    }

}
