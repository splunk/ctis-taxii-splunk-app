import ipaddress

def ip_is_ipv4(ip: str) -> bool:
    try:
        address = ipaddress.ip_address(ip)
        return isinstance(address, ipaddress.IPv4Address)
    except ValueError:
        try:
            address_range = ipaddress.ip_network(ip, strict=False)
            return isinstance(address_range, ipaddress.IPv4Network)
        except ValueError:
            pass

    return False

def ip_is_ipv6(ip: str) -> bool:
    try:
        address = ipaddress.ip_address(ip)
        return isinstance(address, ipaddress.IPv6Address)
    except ValueError:
        return False
