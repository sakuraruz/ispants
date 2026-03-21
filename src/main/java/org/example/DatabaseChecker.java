// Файл: src/main/java/org/example/DatabaseChecker.java
package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseChecker {

    // ВАЖНО: Укажите здесь актуальные данные для подключения к вашей БД
    private static final String URL = "jdbc:postgresql://localhost:5432/analytics_db";
    private static final String USER = "root";
    private static final String PASSWORD = "rootpassword";

    public static void main(String[] args) {
        System.out.println("⏳ Начинаем проверку подключения к базе данных...");

        // Пытаемся установить соединение
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             Statement stmt = conn.createStatement()) {

            System.out.println("✅ Успешно подключено к базе данных!");

            // Проверка 1: Считаем общее количество строк (должно быть 50 000)
            ResultSet rsCount = stmt.executeQuery("SELECT count(*) FROM dataset");
            if (rsCount.next()) {
                System.out.println("✅ Количество строк в таблице 'dataset': " + rsCount.getInt(1));
            }

            // Проверка 2: Вытаскиваем одну строку (первые пару атрибутов) для наглядности
            ResultSet rsData = stmt.executeQuery("SELECT id, feature_1, feature_2 FROM dataset LIMIT 1");
            if (rsData.next()) {
                System.out.println("✅ Пример данных из первой строки:");
                System.out.println("   ID: " + rsData.getInt("id"));
                System.out.println("   Feature 1: " + rsData.getDouble("feature_1"));
                System.out.println("   Feature 2: " + rsData.getDouble("feature_2"));
            }

            System.out.println("🎉 Проверка успешно завершена. База данных полностью готова к работе с приложением!");

        } catch (Exception e) {
            System.err.println("❌ Ошибка при подключении к БД или выполнении запроса!");
            System.err.println("Проверьте, запущена ли база данных и верны ли логин/пароль.");
            e.printStackTrace();
        }
    }
}