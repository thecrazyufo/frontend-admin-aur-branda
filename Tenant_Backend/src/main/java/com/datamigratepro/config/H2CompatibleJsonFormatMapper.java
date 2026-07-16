package com.datamigratepro.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.format.FormatMapper;
import org.hibernate.type.format.jackson.JacksonJsonFormatMapper;

public class H2CompatibleJsonFormatMapper implements FormatMapper {
    private final JacksonJsonFormatMapper delegate = new JacksonJsonFormatMapper();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public <T> T fromString(CharSequence string, JavaType<T> javaType, WrapperOptions wrapperOptions) {
        try {
            return delegate.fromString(string, javaType, wrapperOptions);
        } catch (Exception e) {
            try {
                String unescaped = mapper.readValue(string.toString(), String.class);
                return delegate.fromString(unescaped, javaType, wrapperOptions);
            } catch (Exception ignored) {
                throw e;
            }
        }
    }

    @Override
    public <T> String toString(T value, JavaType<T> javaType, WrapperOptions wrapperOptions) {
        return delegate.toString(value, javaType, wrapperOptions);
    }
}
