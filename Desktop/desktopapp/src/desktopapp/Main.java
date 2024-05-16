package desktopapp;

import javax.swing.*;
import java.awt.*;

public class Main {
    public static String ipAddress;

	public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("ESP32: Robotska ruka");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(1280, 720);
            frame.setLayout(new GridLayout(1, 1));

            // Create panel for sliders and IP input
            JPanel slidersPanel = new JPanel();
            slidersPanel.setLayout(new BorderLayout());

            // IP input
            JPanel ipPanel = new JPanel();
            JLabel ipLabel = new JLabel("IP Address:");
            JTextField ipTextField = new JTextField(15);
            ipPanel.add(ipLabel);
            ipPanel.add(ipTextField);
            
         // Add a button to set the IP address
            JButton setIPButton = new JButton("Set IP");
            setIPButton.addActionListener(e -> {
                ipAddress = ipTextField.getText();
                SendAction.sendAction("restart", 0);
            });
            ipPanel.add(setIPButton);

            slidersPanel.add(ipPanel, BorderLayout.NORTH);

            // Kreiranje Panela
            JPanel slidersInnerPanel = new JPanel();
            slidersInnerPanel.setLayout(new GridLayout(7, 1));

            // Niz za imena klizača
            String[] sliderNames = {"base", "shoulder", "upperArm", "hand", "gripper", "gripperTop"};
            for (String sliderName : sliderNames) {
                JPanel sliderWithLabel = new JPanel(new BorderLayout());

                JLabel sliderLabel = new JLabel(sliderName, SwingConstants.CENTER);
                sliderWithLabel.add(sliderLabel, BorderLayout.PAGE_START);

                JSlider slider = new JSlider(JSlider.HORIZONTAL, -90, 90, 0);
                slider.setMajorTickSpacing(30);
                slider.setMinorTickSpacing(10);
                slider.setPaintTicks(true);
                slider.setPaintLabels(true);

                slider.addChangeListener(e -> {
                	SendAction.sendAction(sliderName, slider.getValue());
                });

                sliderWithLabel.add(slider, BorderLayout.CENTER);

                slidersInnerPanel.add(sliderWithLabel);
            }
            slidersPanel.add(slidersInnerPanel, BorderLayout.CENTER);
            frame.add(slidersPanel);
            // Create panel for buttons (save, play, restart)
            JPanel buttonPanel = new JPanel();
            JButton saveButton = new JButton("Save");
            JButton playButton = new JButton("Play");
            JButton restartButton = new JButton("Restart");

            saveButton.addActionListener(e -> {
            	SendAction.sendAction("save", 0);
            });

            playButton.addActionListener(e -> {
            	SendAction.sendAction("play", 0);
            });

            restartButton.addActionListener(e -> {
            	SendAction.sendAction("restart", 0);
            });

            buttonPanel.add(saveButton);
            buttonPanel.add(playButton);
            buttonPanel.add(restartButton);

            slidersPanel.add(buttonPanel, BorderLayout.SOUTH);

            frame.add(slidersPanel);

            // serial monitor panel
            JPanel serialMonitorPanel = new JPanel(new BorderLayout());
            JTextArea textArea = new JTextArea();
            textArea.setEditable(false);
            JScrollPane scrollPane = new JScrollPane(textArea);
            serialMonitorPanel.add(scrollPane, BorderLayout.CENTER);

            JComboBox<String> portComboBox = new JComboBox<>();
            SerialMonitor.serialPorts(portComboBox);

            serialMonitorPanel.add(portComboBox, BorderLayout.NORTH);

            JButton startButton = new JButton("Start");
            startButton.addActionListener(e -> {
                String selectedPort = (String) portComboBox.getSelectedItem();
                SerialMonitor.serialMonitor(selectedPort, textArea);
            });
            serialMonitorPanel.add(startButton, BorderLayout.SOUTH);

            frame.add(serialMonitorPanel);

            frame.setVisible(true);
        });
    }
}