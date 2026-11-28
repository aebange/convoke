package com.convoke.models.groups;

public class GetGroupNameAvailabilityDTO {
    private String name;
    private boolean exists;
    private boolean available;
    private String message;

    public GetGroupNameAvailabilityDTO(String name, boolean exists, boolean available, String message) {
        this.name      = name;
        this.exists    = exists;
        this.available = available;
        this.message   = message;
    }

    public String getName()      { return name; }
    public boolean isExists()    { return exists; }
    public boolean isAvailable() { return available; }
    public String getMessage()   { return message; }
}
