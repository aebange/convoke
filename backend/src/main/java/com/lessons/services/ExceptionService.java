package com.lessons.services;

import com.lessons.models.GetExceptionDTO;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class ExceptionService {
    private static final Logger logger = LoggerFactory.getLogger(ExceptionService.class);

    @Resource
    private DataSource dataSource;

    @Resource
    private DatabaseService databaseService;

    @Resource
    private VersionService versionService;

    BeanPropertyRowMapper<GetExceptionDTO> rowMapperToGetExceptions = new BeanPropertyRowMapper<>(GetExceptionDTO.class);


    private String appVersion;

    private final String APPLICATION_NAME = "placerl";

    private final int LAST_ONE_DAY_FILTER = 1;
    private final int LAST_SEVEN_DAY_FILTER = 2;
    private final int LAST_THIRTY_DAY_FILTER = 3;
    private final int YEAR_TO_DATE_FILTER = 4;


    @PostConstruct
    public void init() {
        // Get the application version from the VersionService
        this.appVersion = this.versionService.getAppVersion();
    }


    /**
     * Save an exception to the EXCEPTIONS table
     *
     * @param aException holds the exception to record
     * @param aRequestURI holds the URI that failed (may be null)
     * @return the unique id of the exception record that was generated
     */
    public Integer saveExceptionReturnId(Exception aException, String aRequestURI) {
        if (aException == null) {
            logger.error("Error in saveExceptionReturnId(): Exception object is null");
            return null;
        }

        // Generate a unique ID for the exception
        Integer exceptionId = databaseService.getNextId();

        // Get the stack trace as a string separated by newline characters
        String stackTraceAsString = getStackTraceAsString(aException);

        // Capture the cause of the traceback if it is known, otherwise set it to null
        String causeAsString = null;
        if (aException.getCause() != null) {
            causeAsString = aException.getCause().toString();
        }

        // Construct the SQL to insert this record into the exceptions table
        String sql = "insert into exceptions(id, url, event_date, message, cause, app_name, app_version, stack_trace) " +
                     "values(:id, :url, now(), :message, :cause, :app_name, :app_version, :stack_trace);\n";

        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("id",             exceptionId);
        paramMap.put("url",            aRequestURI);
        paramMap.put("message",        aException.getLocalizedMessage());
        paramMap.put("cause",          causeAsString);
        paramMap.put("stack_trace",    stackTraceAsString);
        paramMap.put("app_version",    this.appVersion);
        paramMap.put("app_name",       this.APPLICATION_NAME);

        NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(this.dataSource);

        // Add a record to the exceptions table
        np.update(sql, paramMap);

        // Return the newly-generated exceptionId
        return exceptionId;
    }


    /**
     * @param aException holds the exception object to examine
     * @return the stack trace as a string with newlines
     */
    private String getStackTraceAsString(Exception aException) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : aException.getStackTrace()) {
            sb.append(element.toString());
            sb.append("\n");
        }
        return sb.toString();
    }
}
