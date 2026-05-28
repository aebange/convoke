package com.convoke.models.groups;

public class GetGroupNameAvailabilityDTO {
    private String name;
    private boolean available;
    private String message;

    public GetGroupNameAvailabilityDTO(String name, boolean available, String message) {
        this.name      = name;
        this.available = available;
        this.message   = message;
    }

    public String getName()      { return name; }
    public boolean isAvailable() { return available; }
    public String getMessage()   { return message; }
}
