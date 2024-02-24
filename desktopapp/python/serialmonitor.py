import sys
import serial.tools.list_ports
import serial

def main(serial_port):
    # Postavljanje serijskog porta
    ser = serial.Serial(serial_port, 115200)

    while True:
        # Čitanje podataka s serijskog porta
        serial_data = ser.readline().strip()
        if serial_data:
            # Ispis podataka
            print(serial_data.decode())
            sys.stdout.flush()

if __name__ == "__main__":
    # Dobivanje spojenih serijskih portova na urečaj
    ports = [port.device for port in serial.tools.list_ports.comports()]
    # Ispis liste serijskih portova
    print("\n".join(ports))

    # Pokretanje glavne funkcije s odabranim serijskim portom
    serial_port = sys.argv[1]
    main(serial_port)
