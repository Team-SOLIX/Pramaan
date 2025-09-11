// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    mapping(bytes32 => bool) private certificateExists;

    event CertificateAdded(bytes32 indexed hash);

    function addCertificate(bytes32 hash) external {
        require(hash != bytes32(0), "Invalid hash");
        require(!certificateExists[hash], "Already added");
        certificateExists[hash] = true;
        emit CertificateAdded(hash);
    }

    function verifyCertificate(bytes32 hash) external view returns (bool) {
        return certificateExists[hash];
    }
} 