@SpringBootApplication(scanBasePackages = {"org.example", "service", "repository", "dto"})
@RestController
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}